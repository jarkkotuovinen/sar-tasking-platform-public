# AOI Validation Service

Python FastAPI microservice for validating Areas of Interest (AOI) for SAR tasking requests.

## Features

- Geometric validation using Shapely
- Area calculation in km²
- Resolution mode-specific constraints
- Self-intersection detection
- Coordinate bounds validation
- Aspect ratio analysis
- JWT-based authentication
- Comprehensive error and warning reporting

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status.

### Validate AOI
```
POST /api/v1/validate
Authorization: Bearer <JWT_TOKEN>

Request Body:
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [24.9354, 60.1695],
        [24.9454, 60.1695],
        [24.9454, 60.1795],
        [24.9354, 60.1795],
        [24.9354, 60.1695]
      ]
    ]
  },
  "resolution_mode": "STRIPMAP",
  "priority": "MEDIUM"
}

Response:
{
  "valid": true,
  "area_km2": 50.5,
  "perimeter_km": 28.4,
  "errors": [],
  "warnings": [],
  "geometry_type": "Polygon",
  "is_simple": true,
  "is_closed": true,
  "centroid": [24.9404, 60.1745]
}
```

### Get Validation Limits
```
GET /api/v1/limits
Authorization: Bearer <JWT_TOKEN>

Response:
{
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
    }
  }
}
```

## Validation Rules

### Global Constraints
- Minimum area: 1 km²
- Maximum area: 10,000 km²
- Valid latitude: -90° to 90°
- Valid longitude: -180° to 180°
- No self-intersections
- Polygon must be closed

### Resolution Mode Constraints

#### SPOTLIGHT Mode
- Maximum area: 100 km²
- Recommended maximum: 50 km² (warning if exceeded)
- Best for: High-resolution, small area imaging

#### STRIPMAP Mode
- Maximum area: 1,000 km²
- Best for: Medium resolution, medium area imaging

#### SCANSAR Mode
- Maximum area: 10,000 km²
- Best for: Wide area coverage, lower resolution

### Warnings
- High aspect ratio (>10:1)
- Area approaching mode limits
- Geometry close to polar regions

## Setup

### Prerequisites
- Python 3.11 or higher
- pip

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration (ensure JWT_SECRET matches backend)

5. Run the service:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8002
```

The service will start on port 8002 (configurable via PORT env var).

## Development

### Run with hot reload:
```bash
uvicorn main:app --reload --port 8002
```

### Run tests:
```bash
pytest tests/ -v
```

### Type checking:
```bash
mypy main.py
```

### Linting:
```bash
ruff check .
black .
```

## Authentication

This service uses JWT tokens for authentication. The JWT secret must match the backend service's JWT secret. Tokens should be included in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Codes

| Code | Description | Severity |
|------|-------------|----------|
| INVALID_GEOMETRY | Polygon geometry is invalid | error |
| AOI_TOO_SMALL | Area below 1 km² | error |
| AOI_TOO_LARGE | Area exceeds 10,000 km² | error |
| AOI_TOO_LARGE_FOR_MODE | Area exceeds mode-specific limit | error |
| SELF_INTERSECTION | Polygon has self-intersecting edges | error |
| INVALID_LONGITUDE | Longitude out of bounds | error |
| INVALID_LATITUDE | Latitude out of bounds | error |
| AOI_LARGE_FOR_SPOTLIGHT | Area large for Spotlight mode | warning |
| HIGH_ASPECT_RATIO | Elongated polygon shape | warning |

## Architecture Notes

### Current Implementation
- Shapely for geometric operations
- Simple area calculation (degree-based approximation)
- In-memory validation (no database)

### Production Enhancements
Would include:
- Proper UTM projection for accurate area calculation
- Database for validation history
- Caching layer (Redis)
- Rate limiting
- Prometheus metrics
- More sophisticated geometric analysis
- Country boundary validation
- No-fly zone checking
- Terrain analysis integration

## Dependencies

- **FastAPI**: Modern, fast web framework
- **Pydantic**: Data validation using Python type hints
- **Shapely**: Computational geometry library
- **PyJWT**: JWT token handling
- **uvicorn**: ASGI server
- **python-dotenv**: Environment variable management

## Performance

- Sub-100ms validation response times
- Async request handling
- Suitable for high-throughput scenarios
- Easily scalable horizontally

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Service port | 8002 |
| JWT_SECRET | JWT signing secret | - (required) |
| SERVICE_NAME | Service identifier | aoi-validator |
| LOG_LEVEL | Logging level | info |

## Security

- JWT token validation on all protected endpoints
- CORS configuration
- Input validation via Pydantic
- Geometry sanitization
- Request size limits
