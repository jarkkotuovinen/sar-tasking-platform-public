# Satellite Pass Predictor Service

Go-based microservice for predicting SAR satellite passes over specified locations.

## Features

- Satellite pass prediction for multiple SAR satellites
- JWT-based authentication
- RESTful API with Gin framework
- CORS support for frontend integration
- Health check endpoint
- Configurable minimum elevation angle

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status.

### Predict Satellite Passes
```
POST /api/v1/predict-passes
Authorization: Bearer <JWT_TOKEN>

Request Body:
{
  "latitude": 60.1745,
  "longitude": 24.9404,
  "start_date": "2024-10-09T00:00:00Z",
  "end_date": "2024-10-16T00:00:00Z",
  "min_elevation": 10.0
}

Response:
{
  "passes": [
    {
      "id": "pass-123",
      "satellite_name": "SAR-SAT-1",
      "start_time": "2024-10-09T06:15:00Z",
      "end_time": "2024-10-09T06:23:00Z",
      "max_elevation": 45.5,
      "direction": "ASCENDING",
      "latitude": 60.1745,
      "longitude": 24.9404,
      "visibility_window_seconds": 480
    }
  ],
  "total_count": 15,
  "location": {
    "latitude": 60.1745,
    "longitude": 24.9404
  }
}
```

### Get Satellite Information
```
GET /api/v1/satellite-info
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "satellites": [
    {
      "name": "SAR-SAT-1",
      "norad_id": 43111,
      "status": "operational",
      "orbit_type": "LEO",
      "altitude_km": 570,
      "inclination": 97.69
    }
  ],
  "count": 3
}
```

## Setup

### Prerequisites
- Go 1.22 or higher

### Installation

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration (ensure JWT_SECRET matches backend)

3. Install dependencies:
```bash
go mod download
```

4. Run the service:
```bash
go run .
```

The service will start on port 8001 (configurable via PORT env var).

## Development

### Run with hot reload (air):
```bash
# Install air
go install github.com/cosmtrek/air@latest

# Run with hot reload
air
```

### Run tests:
```bash
go test ./... -v
```

### Build for production:
```bash
go build -o satellite-pass-predictor
./satellite-pass-predictor
```

## Authentication

This service uses JWT tokens for authentication. The JWT secret must match the backend service's JWT secret. Tokens should be included in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Architecture Notes

### Current Implementation (Demo)
- Simulated satellite pass calculations
- Simplified orbital mechanics
- Mock satellite constellation

### Production Implementation (Future)
Would include:
- Real TLE (Two-Line Element) data from Space-Track.org
- SGP4 orbital propagator
- Observer ground station calculations
- Actual SAR satellite constellation data
- Database for caching predictions
- Redis for rate limiting
- Prometheus metrics

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Service port | 8001 |
| JWT_SECRET | JWT signing secret | - (required) |
| SERVICE_NAME | Service identifier | satellite-pass-predictor |
| LOG_LEVEL | Logging level | info |

## Security

- JWT token validation on all protected endpoints
- CORS configuration
- Input validation for all requests
- Rate limiting (to be implemented)

## Performance

- Lightweight Go implementation
- Sub-millisecond response times for predictions
- Concurrent request handling via Gin
- Suitable for containerization and horizontal scaling
