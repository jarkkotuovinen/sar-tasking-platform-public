"""
AOI Validation Service
Python microservice for validating Areas of Interest (AOI) for SAR tasking requests.
"""

import os
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, field_validator
from shapely.geometry import Polygon, shape
from shapely.validation import explain_validity
import jwt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "")
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required")

PORT = int(os.getenv("PORT", "8002"))

# Initialize FastAPI app
app = FastAPI(
    title="AOI Validation Service",
    description="Validates Areas of Interest for SAR tasking requests",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()


# Models
class Coordinates(BaseModel):
    """GeoJSON coordinates"""
    type: str = "Polygon"
    coordinates: List[List[List[float]]]


class AOIGeometry(BaseModel):
    """AOI Geometry model"""
    type: str = "Polygon"
    coordinates: List[List[List[float]]]

    @field_validator('coordinates')
    @classmethod
    def validate_coordinates(cls, v):
        if not v or len(v) == 0:
            raise ValueError("Coordinates cannot be empty")
        if len(v[0]) < 4:
            raise ValueError("Polygon must have at least 4 points")
        # Check if polygon is closed (first and last points are the same)
        if v[0][0] != v[0][-1]:
            raise ValueError("Polygon must be closed (first and last points must match)")
        return v


class ValidationRequest(BaseModel):
    """Request model for AOI validation"""
    geometry: AOIGeometry
    resolution_mode: str = Field(..., pattern="^(SPOTLIGHT|STRIPMAP|SCANSAR)$")
    priority: Optional[str] = Field(None, pattern="^(LOW|MEDIUM|HIGH|URGENT)$")


class ValidationError(BaseModel):
    """Validation error model"""
    code: str
    message: str
    severity: str  # "error" or "warning"


class ValidationResponse(BaseModel):
    """Response model for AOI validation"""
    valid: bool
    area_km2: float
    perimeter_km: float
    errors: List[ValidationError]
    warnings: List[ValidationError]
    geometry_type: str
    is_simple: bool  # No self-intersections
    is_closed: bool
    centroid: List[float]  # [lon, lat]


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    time: datetime


# JWT Authentication
async def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


# Validation logic
def calculate_area_km2(polygon: Polygon) -> float:
    """
    Calculate approximate area in km² using simple projection.
    For production, use proper geographic projections (e.g., UTM).
    """
    # Simple approximation: 1 degree ≈ 111 km at equator
    # This is simplified; production would use proper projection
    bounds = polygon.bounds
    lat_avg = (bounds[1] + bounds[3]) / 2

    # Adjust for latitude (Earth is not perfectly spherical)
    km_per_deg_lon = 111.32 * abs(cos_degrees(lat_avg))
    km_per_deg_lat = 110.54

    # Project coordinates to approximate km
    coords = list(polygon.exterior.coords)
    projected = []
    for lon, lat in coords:
        x = lon * km_per_deg_lon
        y = lat * km_per_deg_lat
        projected.append((x, y))

    # Calculate area of projected polygon
    projected_polygon = Polygon(projected)
    return projected_polygon.area


def cos_degrees(degrees: float) -> float:
    """Convert degrees to radians and calculate cosine"""
    import math
    return math.cos(math.radians(degrees))


def calculate_perimeter_km(polygon: Polygon) -> float:
    """Calculate approximate perimeter in km"""
    bounds = polygon.bounds
    lat_avg = (bounds[1] + bounds[3]) / 2

    km_per_deg_lon = 111.32 * abs(cos_degrees(lat_avg))
    km_per_deg_lat = 110.54

    coords = list(polygon.exterior.coords)
    perimeter = 0
    for i in range(len(coords) - 1):
        lon1, lat1 = coords[i]
        lon2, lat2 = coords[i + 1]

        dx = (lon2 - lon1) * km_per_deg_lon
        dy = (lat2 - lat1) * km_per_deg_lat

        distance = (dx**2 + dy**2)**0.5
        perimeter += distance

    return perimeter


def validate_aoi(geometry: AOIGeometry, resolution_mode: str) -> ValidationResponse:
    """Validate AOI geometry and constraints"""
    errors = []
    warnings = []

    try:
        # Create Shapely polygon
        geom_dict = geometry.model_dump()
        polygon = shape(geom_dict)

        # Check if polygon is valid
        if not polygon.is_valid:
            errors.append(ValidationError(
                code="INVALID_GEOMETRY",
                message=f"Invalid geometry: {explain_validity(polygon)}",
                severity="error"
            ))
            # Return early if geometry is fundamentally invalid
            return ValidationResponse(
                valid=False,
                area_km2=0,
                perimeter_km=0,
                errors=errors,
                warnings=warnings,
                geometry_type=polygon.geom_type,
                is_simple=polygon.is_simple,
                is_closed=polygon.exterior.is_closed if hasattr(polygon, 'exterior') else False,
                centroid=[0, 0]
            )

        # Calculate metrics
        area_km2 = calculate_area_km2(polygon)
        perimeter_km = calculate_perimeter_km(polygon)
        centroid = polygon.centroid

        # Validate area constraints
        if area_km2 < 1:
            errors.append(ValidationError(
                code="AOI_TOO_SMALL",
                message=f"AOI area ({area_km2:.2f} km²) is below minimum (1 km²)",
                severity="error"
            ))

        if area_km2 > 10000:
            errors.append(ValidationError(
                code="AOI_TOO_LARGE",
                message=f"AOI area ({area_km2:.2f} km²) exceeds maximum (10,000 km²)",
                severity="error"
            ))

        # Resolution mode specific validation
        if resolution_mode == "SPOTLIGHT":
            if area_km2 > 100:
                errors.append(ValidationError(
                    code="AOI_TOO_LARGE_FOR_MODE",
                    message=f"AOI area ({area_km2:.2f} km²) exceeds Spotlight mode maximum (100 km²)",
                    severity="error"
                ))
            elif area_km2 > 50:
                warnings.append(ValidationError(
                    code="AOI_LARGE_FOR_SPOTLIGHT",
                    message=f"AOI area ({area_km2:.2f} km²) is large for Spotlight mode. Consider Stripmap.",
                    severity="warning"
                ))

        elif resolution_mode == "STRIPMAP":
            if area_km2 > 1000:
                errors.append(ValidationError(
                    code="AOI_TOO_LARGE_FOR_MODE",
                    message=f"AOI area ({area_km2:.2f} km²) exceeds Stripmap mode maximum (1,000 km²)",
                    severity="error"
                ))

        # Check for self-intersections
        if not polygon.is_simple:
            errors.append(ValidationError(
                code="SELF_INTERSECTION",
                message="Polygon has self-intersecting edges",
                severity="error"
            ))

        # Check coordinate bounds
        bounds = polygon.bounds
        if bounds[0] < -180 or bounds[2] > 180:
            errors.append(ValidationError(
                code="INVALID_LONGITUDE",
                message=f"Longitude out of valid range [-180, 180]: {bounds}",
                severity="error"
            ))

        if bounds[1] < -90 or bounds[3] > 90:
            errors.append(ValidationError(
                code="INVALID_LATITUDE",
                message=f"Latitude out of valid range [-90, 90]: {bounds}",
                severity="error"
            ))

        # Check aspect ratio (warn if very elongated)
        width = bounds[2] - bounds[0]
        height = bounds[3] - bounds[1]
        if width > 0 and height > 0:
            aspect_ratio = max(width/height, height/width)
            if aspect_ratio > 10:
                warnings.append(ValidationError(
                    code="HIGH_ASPECT_RATIO",
                    message=f"AOI has high aspect ratio ({aspect_ratio:.1f}:1). This may affect image quality.",
                    severity="warning"
                ))

        return ValidationResponse(
            valid=len(errors) == 0,
            area_km2=round(area_km2, 2),
            perimeter_km=round(perimeter_km, 2),
            errors=errors,
            warnings=warnings,
            geometry_type=polygon.geom_type,
            is_simple=polygon.is_simple,
            is_closed=polygon.exterior.is_closed,
            centroid=[round(centroid.x, 6), round(centroid.y, 6)]
        )

    except Exception as e:
        errors.append(ValidationError(
            code="VALIDATION_ERROR",
            message=f"Unexpected validation error: {str(e)}",
            severity="error"
        ))
        return ValidationResponse(
            valid=False,
            area_km2=0,
            perimeter_km=0,
            errors=errors,
            warnings=warnings,
            geometry_type="Unknown",
            is_simple=False,
            is_closed=False,
            centroid=[0, 0]
        )


# Routes
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="aoi-validator",
        version="1.0.0",
        time=datetime.utcnow()
    )


@app.post("/api/v1/validate", response_model=ValidationResponse)
async def validate_aoi_endpoint(
    request: ValidationRequest,
    user: dict = Depends(verify_jwt)
):
    """
    Validate an Area of Interest (AOI) for SAR tasking.

    Checks:
    - Geometry validity
    - Area constraints (1-10,000 km²)
    - Resolution mode specific limits
    - Self-intersections
    - Coordinate bounds
    - Aspect ratio
    """
    return validate_aoi(request.geometry, request.resolution_mode)


@app.get("/api/v1/limits")
async def get_validation_limits(user: dict = Depends(verify_jwt)):
    """Get AOI validation limits for different resolution modes"""
    return {
        "global": {
            "min_area_km2": 1,
            "max_area_km2": 10000,
            "coordinate_bounds": {
                "latitude": [-90, 90],
                "longitude": [-180, 180]
            }
        },
        "resolution_modes": {
            "SPOTLIGHT": {
                "max_area_km2": 100,
                "recommended_max_km2": 50,
                "description": "High resolution, small area imaging"
            },
            "STRIPMAP": {
                "max_area_km2": 1000,
                "description": "Medium resolution, medium area imaging"
            },
            "SCANSAR": {
                "max_area_km2": 10000,
                "description": "Wide area imaging, lower resolution"
            }
        }
    }


# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=True,
        log_level="info"
    )
