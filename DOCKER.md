# Docker Deployment Guide

Complete guide for running the SAR Tasking Platform with Docker and Docker Compose.

## Architecture

The platform consists of 5 containerized services:

```
┌─────────────────────────────────────────────────┐
│              Docker Network                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Frontend │  │ Backend  │  │PostgreSQL│      │
│  │  Nginx   │  │  NestJS  │  │          │      │
│  │  Port 80 │  │ Port 4000│  │Port 5432 │      │
│  └─────┬────┘  └────┬─────┘  └─────┬────┘      │
│        │            │               │           │
│        │      ┌─────┴─────┐         │           │
│        │      │           │         │           │
│        │  ┌───┴──┐    ┌──┴───┐     │           │
│        │  │  Go  │    │Python│     │           │
│        │  │ Sat. │    │ AOI  │     │           │
│        │  │ Pass │    │Valid.│     │           │
│        │  │ 8001 │    │ 8002 │     │           │
│        │  └──────┘    └──────┘     │           │
│        └───────────────────────────┘           │
└─────────────────────────────────────────────────┘
```

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- 10GB free disk space

## Quick Start (Development)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd iceye-tasking-platform
```

### 2. Start All Services

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 3. Initialize Database

```bash
# Run Prisma migrations
docker-compose exec backend npx prisma migrate deploy

# Optional: Seed database
docker-compose exec backend npx prisma db seed
```

### 4. Access Services

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api
- **Satellite Pass Service**: http://localhost:8001/health
- **AOI Validator**: http://localhost:8002/health
- **AOI Validator Docs**: http://localhost:8002/docs

## Production Deployment

### 1. Environment Setup

```bash
# Copy environment template
cp .env.docker.example .env.docker

# Edit with production values
nano .env.docker
```

**Critical:** Update these values:
- `POSTGRES_PASSWORD` - Strong database password
- `JWT_SECRET` - Long random string (min 64 characters)
- `DATABASE_URL` - Include the new password

### 2. Build Production Images

```bash
docker-compose -f docker-compose.prod.yml build
```

### 3. Start Production Stack

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.docker up -d
```

### 4. Run Database Migrations

```bash
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## Service Details

### Frontend (React + Nginx)
**Development:**
- Vite dev server with hot reload
- Port 5173
- Volume mounted for live code changes

**Production:**
- Optimized production build
- Nginx serving static files
- Gzip compression
- Security headers
- SPA routing configured

### Backend (NestJS)
**Development:**
- Hot reload enabled
- Debug port available
- Volume mounted for live changes

**Production:**
- Optimized build
- Health checks configured
- Automatic restart on failure
- Non-root user

### Satellite Pass Predictor (Go)
**Production:**
- Multi-stage build (minimal final image)
- Alpine Linux base (~15MB)
- Health checks
- Non-root user
- Automatic restart

### AOI Validator (Python)
**Production:**
- Multi-stage build
- Optimized dependencies
- Health checks
- Non-root user
- Automatic restart

### PostgreSQL
- Persistent data volume
- Health checks
- Automatic restart
- Connection pooling ready

## Docker Commands Reference

### Build Commands

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend

# Build without cache
docker-compose build --no-cache

# Pull latest base images
docker-compose pull
```

### Run Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Start specific services
docker-compose up frontend backend postgres

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
```

### Management Commands

```bash
# List running containers
docker-compose ps

# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop backend

# Restart service
docker-compose restart backend

# Remove containers (keeps volumes)
docker-compose down

# Remove containers and volumes (DANGER: deletes data!)
docker-compose down -v
```

### Database Commands

```bash
# Run Prisma migrations
docker-compose exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose exec backend npx prisma generate

# Open Prisma Studio
docker-compose exec backend npx prisma studio

# Database backup
docker-compose exec postgres pg_dump -U postgres sar_tasking > backup.sql

# Database restore
docker-compose exec -T postgres psql -U postgres sar_tasking < backup.sql
```

### Shell Access

```bash
# Backend shell
docker-compose exec backend sh

# Database shell
docker-compose exec postgres psql -U postgres -d sar_tasking

# Go service shell
docker-compose exec satellite-pass sh

# Python service shell
docker-compose exec aoi-validator sh
```

## Health Checks

All services include health checks. Check status:

```bash
# View health status
docker-compose ps

# Inspect specific container
docker inspect sar-tasking-backend | grep -A 10 Health
```

## Volumes

### Development
- Code directories mounted as volumes
- `node_modules` excluded (Docker-managed)
- Hot reload enabled

### Production
- Only persistent data volumes
- No code mounts
- Optimized images

### Data Persistence

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect sar-tasking-platform_postgres_data

# Backup volume
docker run --rm -v sar-tasking-platform_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore volume
docker run --rm -v sar-tasking-platform_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz
```

## Networking

### Development
- All services on `sar-tasking-network` bridge
- Services communicate via service names
- Exposed ports accessible from host

### Production
- Internal network for service communication
- Only reverse proxy exposed externally
- Database not exposed to host

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs -f <service-name>

# Check if port is already in use
lsof -i :4000

# Rebuild service
docker-compose up --build <service-name>
```

### Database Connection Issues

```bash
# Verify database is healthy
docker-compose exec postgres pg_isready -U postgres

# Check connection string
docker-compose exec backend env | grep DATABASE_URL

# Test connection
docker-compose exec postgres psql -U postgres -d sar_tasking -c "SELECT 1"
```

### Out of Memory

```bash
# Check Docker memory limit
docker system info | grep Memory

# Increase Docker memory (Docker Desktop)
# Settings -> Resources -> Memory

# Check container memory usage
docker stats
```

### Network Issues

```bash
# List networks
docker network ls

# Inspect network
docker network inspect sar-tasking-platform_sar-tasking-network

# Recreate network
docker-compose down
docker-compose up
```

## Performance Optimization

### Development

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build

# Use layer caching
docker-compose build --parallel
```

### Production

```bash
# Multi-stage builds (already implemented)
# Minimize layers
# Use .dockerignore (already configured)
# Enable BuildKit caching
```

## Security Best Practices

### Implemented
- ✅ Multi-stage builds
- ✅ Non-root users in all containers
- ✅ Health checks
- ✅ Security headers (nginx)
- ✅ .dockerignore files
- ✅ Minimal base images
- ✅ Environment variable injection
- ✅ Network isolation

### Production Recommendations
- Use secrets management (Docker Swarm secrets, HashiCorp Vault)
- Enable Docker Content Trust
- Scan images for vulnerabilities
- Use private registry
- Implement log aggregation
- Set resource limits
- Enable SELinux/AppArmor
- Regular image updates

## Resource Limits

Add resource limits in production:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          memory: 512M
```

## Monitoring

### Health Checks

```bash
# Check all services
docker-compose ps

# Continuous health monitoring
watch -n 5 'docker-compose ps'
```

### Logs

```bash
# Follow all logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Since timestamp
docker-compose logs --since 2024-01-01T00:00:00

# Export logs
docker-compose logs > logs.txt
```

### Metrics

Future enhancements:
- Prometheus + Grafana
- cAdvisor for container metrics
- Loki for log aggregation
- Jaeger for distributed tracing

## Cleanup

### Remove Stopped Containers

```bash
docker container prune
```

### Remove Unused Images

```bash
docker image prune -a
```

### Remove Unused Volumes

```bash
# WARNING: This deletes data!
docker volume prune
```

### Complete Cleanup

```bash
# Stop and remove everything
docker-compose down -v

# Remove all Docker resources
docker system prune -a --volumes
```

## CI/CD Integration

See `/.github/workflows/` for automated:
- Image building
- Testing
- Security scanning
- Deployment

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [Best practices for writing Dockerfiles](https://docs.docker.com/develop/dev-best-practices/)
