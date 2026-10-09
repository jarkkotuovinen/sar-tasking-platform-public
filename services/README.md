# SAR Tasking Microservices

This directory contains the microservices that support the SAR Tasking Platform.

## Architecture Overview

The platform uses a microservices architecture with three main components:

```
┌─────────────────┐
│   Frontend      │
│  (React/TS)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │
│  (NestJS/TS)    │
└────┬────────┬───┘
     │        │
     ▼        ▼
┌────────┐  ┌──────────┐
│  Go    │  │ Python   │
│ Sat.   │  │   AOI    │
│ Pass   │  │ Validator│
└────────┘  └──────────┘
```

## Services

### 1. Satellite Pass Predictor (Go)
**Port:** 8001
**Language:** Go 1.22
**Framework:** Gin

Predicts satellite passes for SAR satellite constellation over specified locations.

**Features:**
- Multi-satellite pass prediction
- Time window-based queries
- Elevation angle filtering
- JWT authentication
- RESTful API

**Key Endpoints:**
- `POST /api/v1/predict-passes` - Predict satellite passes
- `GET /api/v1/satellite-info` - Get satellite constellation info
- `GET /health` - Health check

### 2. AOI Validation Service (Python)
**Port:** 8002
**Language:** Python 3.11+
**Framework:** FastAPI

Validates Areas of Interest (AOI) for SAR tasking requests.

**Features:**
- Geometric validation
- Area calculation (km²)
- Resolution mode constraints
- Self-intersection detection
- Coordinate validation
- JWT authentication

**Key Endpoints:**
- `POST /api/v1/validate` - Validate AOI geometry
- `GET /api/v1/limits` - Get validation limits
- `GET /health` - Health check

## Security

All services implement JWT-based authentication:

1. User authenticates with backend (NestJS)
2. Backend issues JWT token
3. Frontend includes JWT in requests to backend
4. Backend forwards JWT to microservices
5. Microservices validate JWT using shared secret

```
JWT_SECRET must be identical across all services!
```

## Setup Instructions

### Prerequisites

- **Go** 1.22+ (for satellite-pass-predictor)
- **Python** 3.11+ (for aoi-validator)
- **Node.js** 22+ (for backend)

### Quick Start

#### 1. Satellite Pass Predictor (Go)

```bash
cd satellite-pass-predictor

# Copy environment file
cp .env.example .env

# Install dependencies
go mod download

# Run service
go run .

# Or with hot reload (air)
air
```

Service will start on `http://localhost:8001`

#### 2. AOI Validation Service (Python)

```bash
cd aoi-validator

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run service
python main.py

# Or with uvicorn
uvicorn main:app --reload --port 8002
```

Service will start on `http://localhost:8002`

### Environment Configuration

Both services require `.env` file with:

```env
PORT=8001 # or 8002 for Python service
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Important:** The `JWT_SECRET` must match the backend's JWT secret!

## Integration with Backend

The NestJS backend includes HTTP clients for both services:

### SatellitePassService (backend/src/services/satellite-pass.service.ts)
```typescript
// Predict passes
await satellitePassService.predictPasses(request, jwtToken);

// Get satellite info
await satellitePassService.getSatelliteInfo(jwtToken);

// Health check
await satellitePassService.checkHealth();
```

### AoiValidationService (backend/src/services/aoi-validation.service.ts)
```typescript
// Validate AOI
await aoiValidationService.validateAoi(request, jwtToken);

// Get limits
await aoiValidationService.getValidationLimits(jwtToken);

// Health check
await aoiValidationService.checkHealth();
```

## Development

### Running All Services

From project root:

```bash
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Go Service
cd services/satellite-pass-predictor && go run .

# Terminal 3: Python Service
cd services/aoi-validator && python main.py

# Terminal 4: Frontend
cd frontend && npm run dev
```

### Testing Microservices

#### Satellite Pass Service

```bash
# Health check
curl http://localhost:8001/health

# Predict passes (requires JWT)
curl -X POST http://localhost:8001/api/v1/predict-passes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 60.1745,
    "longitude": 24.9404,
    "start_date": "2026-10-09T00:00:00Z",
    "end_date": "2026-10-16T00:00:00Z",
    "min_elevation": 10.0
  }'
```

#### AOI Validation Service

```bash
# Health check
curl http://localhost:8002/health

# Validate AOI (requires JWT)
curl -X POST http://localhost:8002/api/v1/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[24.9354, 60.1695], [24.9454, 60.1695], [24.9454, 60.1795], [24.9354, 60.1795], [24.9354, 60.1695]]]
    },
    "resolution_mode": "STRIPMAP"
  }'
```

## Production Considerations

### Performance
- **Go Service**: Sub-millisecond response times, highly concurrent
- **Python Service**: Sub-100ms validation, async-capable
- Both services are stateless and horizontally scalable

### Monitoring
Future enhancements:
- Prometheus metrics endpoints
- OpenTelemetry tracing
- Structured logging (JSON)
- Health check dependencies

### Scaling
- Run multiple instances behind load balancer
- Use service mesh (Istio, Linkerd) for production
- Implement circuit breakers
- Add request rate limiting

### Security Enhancements
For production:
- mTLS between services
- API key rotation
- Rate limiting per user
- Input sanitization (already implemented)
- OWASP security headers

## Troubleshooting

### Service Not Starting

**Go Service:**
```bash
# Check Go version
go version  # Should be 1.22+

# Check port availability
lsof -i :8001

# Check logs
tail -f logs/satellite-pass-predictor.log
```

**Python Service:**
```bash
# Check Python version
python --version  # Should be 3.11+

# Check virtual environment
which python

# Check port availability
lsof -i :8002

# Install dependencies explicitly
pip install fastapi uvicorn shapely pyjwt python-dotenv
```

### Authentication Errors

- Verify JWT_SECRET matches across all services
- Check JWT token hasn't expired
- Ensure Authorization header format: `Bearer <token>`

### Service Unavailable

- Verify service is running: `curl http://localhost:800X/health`
- Check backend can reach service (firewall, Docker network)
- Verify environment variables are loaded

## API Documentation

### Satellite Pass Predictor
- Swagger UI (future): `http://localhost:8001/docs`
- See: `satellite-pass-predictor/README.md`

### AOI Validator
- OpenAPI docs: `http://localhost:8002/docs`
- ReDoc: `http://localhost:8002/redoc`
- See: `aoi-validator/README.md`

## Technology Stack

| Service | Language | Framework | Key Libraries |
|---------|----------|-----------|---------------|
| Satellite Pass | Go 1.22 | Gin | golang-jwt, godotenv |
| AOI Validator | Python 3.11 | FastAPI | Shapely, Pydantic, PyJWT |

## Future Enhancements

### Satellite Pass Predictor
- Real TLE data integration (Space-Track.org)
- SGP4 orbital propagator
- Database caching for predictions
- WebSocket support for live updates

### AOI Validator
- UTM projection for accurate area calculations
- Country boundary validation
- No-fly zone checking
- Terrain analysis integration
- Multi-polygon support

## Contributing

When adding new microservices:

1. Create service directory under `services/`
2. Add README.md with setup instructions
3. Implement `/health` endpoint
4. Use JWT authentication
5. Add HTTP client in `backend/src/services/`
6. Update this README
7. Add Docker configuration
8. Document API endpoints
