<div align="center">

# 🛰️ SAR Tasking Platform

### Enterprise-Grade Satellite Imaging Request & Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0+-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-Terraform-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

*A production-ready full-stack platform for managing Synthetic Aperture Radar (SAR) satellite imaging requests with real-time processing, geospatial visualization, and enterprise-grade infrastructure.*

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation) • [Deployment](#-deployment)

</div>

---

## 🎯 Overview

The SAR Tasking Platform is a comprehensive enterprise solution for managing satellite imaging requests, demonstrating production-grade software engineering practices across the entire development lifecycle. Built with modern technologies and industry best practices, this platform showcases:

- **Full-Stack TypeScript Development** with end-to-end type safety
- **Microservices Architecture** with Go and Python services
- **Cloud-Native Infrastructure** using AWS ECS, RDS, and Terraform
- **Advanced Geospatial Features** with interactive map-based AOI drawing
- **Enterprise Security** with JWT authentication and role-based access
- **Production DevOps** with CI/CD, automated testing, and monitoring

### Use Cases

- **Satellite Operators**: Manage imaging requests across satellite constellations
- **Defense & Intelligence**: Coordinate tactical imaging operations
- **Commercial Applications**: Agricultural monitoring, disaster response, infrastructure planning
- **Research Institutions**: Scientific data collection and analysis

---

## ✨ Key Features

### 🗺️ Interactive Geospatial Interface
- **Mapbox GL Integration** - High-performance vector map rendering
- **Polygon Drawing Tools** - Intuitive AOI (Area of Interest) creation
- **Real-time Validation** - Instant feedback on AOI size and location
- **Multi-layer Visualization** - Satellite footprints, task overlays, terrain data

### 🔐 Enterprise Authentication & Authorization
- **JWT-based Security** - Stateless authentication with secure token management
- **Role-Based Access Control** - Granular permissions (Admin, Operator, Viewer)
- **Organization Multi-tenancy** - Isolated workspaces for different teams
- **Session Management** - Persistent auth with automatic token refresh

### 📡 Satellite Task Management
- **Advanced Task Workflow** - Complete lifecycle from request to delivery
- **Resolution Modes** - Spotlight (50cm), Stripmap (3m), ScanSAR (18m)
- **Polarization Options** - HH, VV, HV, VH dual-pol configurations
- **Priority Scheduling** - Urgent, High, Medium, Low with SLA estimates
- **Validation Pipeline** - Automated AOI checks and conflict detection

### 🛠️ Microservices Architecture
- **Satellite Pass Predictor (Go)** - High-performance orbital calculations
- **AOI Validator (Python)** - Geospatial analysis with Shapely/GeoPandas
- **Backend API (NestJS)** - RESTful API with OpenAPI documentation
- **Frontend SPA (React)** - Modern responsive user interface

### 📊 Real-time Monitoring & Analytics
- **Task Queue Dashboard** - Live status tracking and updates
- **Delivery Estimates** - Intelligent ETA calculations
- **Performance Metrics** - Service health and system status
- **Audit Logging** - Complete activity tracking

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud / Docker                          │
│                                                                          │
│  ┌────────────────┐         ┌──────────────────────────────────┐       │
│  │   React SPA    │────────>│   Application Load Balancer       │       │
│  │  (Port 5173)   │  HTTPS  │         (Port 80/443)             │       │
│  └────────────────┘         └───────────────┬──────────────────┘       │
│                                              │                           │
│  ┌──────────────────────────────────────────┼──────────────────────┐   │
│  │                    Backend Services       │                      │   │
│  │                                           │                      │   │
│  │  ┌────────────────┐    ┌─────────────────▼─────────┐           │   │
│  │  │  Satellite     │    │   NestJS API Gateway      │           │   │
│  │  │  Pass Service  │<───│   (Port 4000)             │           │   │
│  │  │  (Go:8001)     │    │   - REST API              │           │   │
│  │  └────────────────┘    │   - JWT Auth              │           │   │
│  │                        │   - Swagger Docs           │           │   │
│  │  ┌────────────────┐    │   - Business Logic        │           │   │
│  │  │  AOI Validator │<───│                           │           │   │
│  │  │  (Python:8002) │    └────────────┬──────────────┘           │   │
│  │  └────────────────┘                 │                          │   │
│  └─────────────────────────────────────┼──────────────────────────┘   │
│                                         │                              │
│  ┌──────────────────────────────────────▼──────────────────────────┐  │
│  │              PostgreSQL Database (Port 5432)                     │  │
│  │  ┌──────────┬──────────┬──────────┬──────────┬─────────────┐   │  │
│  │  │  Users   │  Tasks   │   AOI    │Satellites│  Products   │   │  │
│  │  └──────────┴──────────┴──────────┴──────────┴─────────────┘   │  │
│  │  Prisma ORM • Multi-AZ • Automated Backups • Encryption        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Supporting Services: S3, CloudWatch, Secrets Manager, ECR      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Database Schema

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │──────<│     Task     │>──────│     AOI      │
├──────────────┤   1:N ├──────────────┤  1:1  ├──────────────┤
│ id           │       │ id           │       │ id           │
│ email        │       │ userId       │       │ taskId       │
│ password     │       │ status       │       │ geometry     │
│ name         │       │ priority     │       │ area_km2     │
│ role         │       │ startDate    │       │ centroid     │
│ orgId        │       │ endDate      │       └──────────────┘
└──────┬───────┘       │ resolution   │
       │               │ polarization │       ┌──────────────┐
       │               │ aoiId        │       │  Satellite   │
       │               └──────┬───────┘       ├──────────────┤
       │                      │               │ id           │
       │                      │               │ name         │
       │               ┌──────▼───────┐       │ orbit        │
       │               │   Product    │       │ sensor_type  │
       │               ├──────────────┤       └──────────────┘
       │               │ id           │              │
       │               │ taskId       │              │
       │               │ deliveryUrl  │       ┌──────▼───────┐
       │               │ format       │       │SatellitePass │
       │               │ resolution   │       ├──────────────┤
       │               └──────────────┘       │ satelliteId  │
       │                                      │ taskId       │
┌──────▼───────┐                             │ passTime     │
│Organization  │                             │ elevation    │
├──────────────┤                             └──────────────┘
│ id           │
│ name         │
│ plan         │
└──────────────┘
```

---

## 📦 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite (HMR, Optimized builds)
- **Styling:** Tailwind CSS 3
- **State Management:** Zustand + React Query
- **Mapping:** Mapbox GL JS + Mapbox Draw
- **Geospatial:** Turf.js for calculations
- **HTTP:** Axios with interceptors
- **Routing:** React Router v6
- **Testing:** Vitest + Testing Library + Playwright

</td>
<td valign="top" width="50%">

### Backend
- **Framework:** NestJS 10 + TypeScript
- **Database:** PostgreSQL 15 + Prisma ORM
- **Authentication:** JWT + Passport.js
- **Validation:** class-validator + class-transformer
- **API Docs:** Swagger/OpenAPI 3.0
- **Testing:** Jest + Supertest
- **Security:** Helmet, bcrypt, CORS

</td>
</tr>
<tr>
<td valign="top" width="50%">

### Microservices
- **Go Service:** Satellite pass predictions
  - Goroutines for concurrent processing
  - High-precision orbital mechanics
- **Python Service:** AOI validation
  - FastAPI framework
  - Shapely, GeoPandas for geospatial ops
  - NumPy for calculations

</td>
<td valign="top" width="50%">

### Infrastructure & DevOps
- **Containerization:** Docker + Docker Compose
- **Cloud:** AWS (ECS, RDS, ALB, S3)
- **IaC:** Terraform (multi-environment)
- **CI/CD:** GitHub Actions
- **Monitoring:** CloudWatch + SNS
- **Security:** AWS Secrets Manager, VPC, IAM

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Download](https://docs.docker.com/get-docker/))
- **Git** ([Download](https://git-scm.com/))
- **npm** or **yarn**

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/sar-tasking-platform.git
cd sar-tasking-platform

# 2. Start all services with Docker Compose
docker-compose up -d

# Wait for all services to be healthy (check with docker-compose ps)
# The platform will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:4000/api
# - API Docs: http://localhost:4000/api/docs
```

### Manual Setup (Without Docker)

<details>
<summary>Click to expand manual setup instructions</summary>

#### 1. Database Setup
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Or use local PostgreSQL
createdb sar_tasking
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database connection

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start backend (development mode)
npm run start:dev
```

#### 3. Microservices Setup
```bash
# Terminal 1 - Satellite Pass Predictor (Go)
cd services/satellite-pass-predictor
go mod download
go run main.go

# Terminal 2 - AOI Validator (Python)
cd services/aoi-validator
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

#### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with API URL

# Start frontend (development mode)
npm run dev
```

</details>

### First-time User Setup

1. **Access the application** at http://localhost:5173
2. **Create an account** using the registration page
3. **Login** with your credentials
4. **Create your first imaging task:**
   - Draw an AOI (Area of Interest) on the map
   - Select imaging parameters (resolution, polarization)
   - Set priority and time window
   - Submit the task

---

## 🎮 Usage Guide

### Creating an Imaging Task

1. **Draw AOI (Area of Interest)**
   - Click the polygon tool in the map controls
   - Click points on the map to create a polygon
   - Double-click or close the polygon to finish
   - AOI validation happens in real-time

2. **Configure Imaging Parameters**
   ```
   Resolution Mode:
   • Spotlight (0.5m) - High detail, small areas (<100 km²)
   • Stripmap (3m) - Balanced, medium areas (<1000 km²)
   • ScanSAR (18m) - Wide coverage, large areas

   Polarization:
   • HH - Horizontal transmit, horizontal receive
   • VV - Vertical transmit, vertical receive
   • HV/VH - Cross-polarization for specific analysis

   Priority:
   • Urgent - 24h delivery
   • High - 48h delivery
   • Medium - 72h delivery
   • Low - 5+ days delivery
   ```

3. **Set Time Window**
   - Start date (must be in the future)
   - End date (max 30 days from start)
   - System calculates optimal satellite passes

4. **Submit & Track**
   - Review task summary
   - Submit for validation
   - Track status in task queue
   - Receive notifications on status changes

### API Usage

The platform provides a comprehensive REST API documented with Swagger/OpenAPI.

**Access API Documentation:**
```
http://localhost:4000/api/docs
```

**Example API Calls:**

```bash
# Register a new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'

# Login and get JWT token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'

# Create a task (requires auth token)
curl -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "HIGH",
    "resolution": "STRIPMAP",
    "polarization": "VV",
    "startDate": "2026-11-01T00:00:00Z",
    "endDate": "2026-11-15T00:00:00Z",
    "aoi": {
      "type": "Polygon",
      "coordinates": [[[24.9, 60.1], [25.0, 60.1], [25.0, 60.2], [24.9, 60.2], [24.9, 60.1]]]
    }
  }'
```

---

## 🧪 Testing

The platform includes comprehensive testing at all levels.

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

**Test Coverage:**
- ✅ Unit tests for services, controllers, guards
- ✅ Integration tests for database operations
- ✅ E2E tests for API endpoints
- ✅ Authentication flow tests
- ✅ Validation logic tests

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm test

# Run E2E tests with Playwright
npm run test:e2e

# Open Playwright UI
npm run test:e2e:ui
```

**Test Coverage:**
- ✅ Component unit tests
- ✅ Hook tests
- ✅ Integration tests for API calls
- ✅ E2E user flows (auth, task creation)
- ✅ Accessibility tests

### Microservices Tests

```bash
# Go service tests
cd services/satellite-pass-predictor
go test -v ./...

# Python service tests
cd services/aoi-validator
pytest -v
```

---

## 🐳 Deployment

### Docker Deployment

#### Development
```bash
docker-compose up -d
```

#### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### AWS Cloud Deployment

Complete AWS infrastructure provisioning with Terraform.

**Prerequisites:**
- AWS Account with appropriate IAM permissions
- AWS CLI configured
- Terraform 1.6+

**Deployment Steps:**

```bash
# 1. Navigate to terraform directory
cd terraform/environments/dev

# 2. Configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 3. Initialize Terraform
terraform init

# 4. Review infrastructure plan
terraform plan -var-file=terraform.tfvars

# 5. Deploy infrastructure
terraform apply -var-file=terraform.tfvars
```

**What gets deployed:**
- ✅ VPC with public/private subnets across 2 AZs
- ✅ Application Load Balancer with SSL/TLS
- ✅ ECS Fargate cluster with auto-scaling
- ✅ RDS PostgreSQL (Multi-AZ in production)
- ✅ ECR repositories for Docker images
- ✅ CloudWatch logs and alarms
- ✅ S3 buckets for assets
- ✅ Secrets Manager for credentials
- ✅ IAM roles with least privilege

**Cost Estimates:**
- Development: ~$150-200/month
- Staging: ~$300-400/month
- Production: ~$600-800/month

For detailed deployment guide, see [terraform/README.md](terraform/README.md)

---

## 📊 Features & Capabilities

### ✅ Completed Features

- [x] **User Authentication System**
  - JWT-based authentication
  - Secure password hashing (bcrypt)
  - Session persistence
  - Role-based access control

- [x] **Interactive Map Interface**
  - Mapbox GL integration
  - Polygon drawing tools
  - Real-time AOI visualization
  - Geospatial calculations

- [x] **Task Management**
  - Complete CRUD operations
  - Status lifecycle tracking
  - Priority-based scheduling
  - Delivery estimation

- [x] **Validation Pipeline**
  - AOI size validation
  - Resolution-specific limits
  - Temporal validation
  - Conflict detection

- [x] **Microservices Integration**
  - Satellite pass predictions (Go)
  - AOI validation (Python)
  - Service health checks
  - Error handling & retries

- [x] **Docker Containerization**
  - Multi-stage builds
  - Development & production configs
  - Health checks
  - Optimized images

- [x] **CI/CD Pipeline**
  - Automated testing
  - Security scanning
  - Docker builds
  - AWS deployment

- [x] **AWS Infrastructure**
  - Terraform IaC
  - Multi-environment support
  - Auto-scaling
  - Monitoring & alerts

### 🚧 Potential Enhancements

- [ ] **Advanced Analytics Dashboard**
  - Task completion metrics
  - Resource utilization charts
  - Cost analysis
  - Performance trends

- [ ] **WebSocket Real-time Updates**
  - Live task status changes
  - Satellite position tracking
  - System notifications

- [ ] **File Upload & Management**
  - Reference data upload
  - Product download
  - S3 integration

- [ ] **Advanced Search & Filtering**
  - Full-text search
  - Complex filters
  - Saved searches

- [ ] **Notification System**
  - Email notifications
  - Webhook integrations
  - SMS alerts

---

## 📁 Project Structure

```
sar-tasking-platform/
├── backend/                    # NestJS API Backend
│   ├── src/
│   │   ├── auth/              # Authentication module (JWT, guards)
│   │   ├── users/             # User management
│   │   ├── tasks/             # Task CRUD & business logic
│   │   ├── services/          # Microservice clients
│   │   ├── prisma/            # Database service & migrations
│   │   ├── common/            # Shared utilities, decorators
│   │   └── main.ts            # Application entry point
│   ├── prisma/
│   │   └── schema.prisma      # Database schema definition
│   ├── test/                  # E2E tests
│   ├── Dockerfile             # Multi-stage Docker build
│   └── package.json
│
├── frontend/                   # React SPA Frontend
│   ├── src/
│   │   ├── api/               # API client & endpoint definitions
│   │   ├── features/
│   │   │   ├── auth/          # Login, Register pages
│   │   │   └── tasks/         # Dashboard, Map, Forms
│   │   ├── components/        # Reusable UI components
│   │   ├── store/             # Zustand state management
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Helper functions
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Application entry
│   ├── e2e/                   # Playwright E2E tests
│   ├── Dockerfile             # Multi-stage Docker build
│   └── package.json
│
├── services/                   # Microservices
│   ├── satellite-pass-predictor/  # Go service
│   │   ├── main.go            # HTTP server & handlers
│   │   ├── orbital/           # Orbital mechanics
│   │   ├── models/            # Data models
│   │   └── Dockerfile
│   │
│   └── aoi-validator/         # Python service
│       ├── main.py            # FastAPI application
│       ├── validation/        # Geospatial validation logic
│       ├── requirements.txt
│       └── Dockerfile
│
├── terraform/                  # Infrastructure as Code
│   ├── modules/
│   │   ├── vpc/               # Network infrastructure
│   │   ├── ecs/               # Container orchestration
│   │   ├── rds/               # Database
│   │   ├── alb/               # Load balancer
│   │   ├── security/          # Security groups
│   │   └── monitoring/        # CloudWatch, alarms
│   ├── environments/
│   │   ├── dev/               # Development config
│   │   ├── staging/           # Staging config
│   │   └── prod/              # Production config
│   ├── main.tf                # Root configuration
│   └── README.md              # Deployment guide
│
├── .github/
│   └── workflows/             # CI/CD pipelines
│       ├── pr-validation.yml  # PR checks & tests
│       ├── docker-build.yml   # Container builds
│       ├── deploy.yml         # AWS deployment
│       └── security.yml       # Security scanning
│
├── docker-compose.yml         # Development orchestration
├── docker-compose.prod.yml    # Production orchestration
└── README.md                  # This file
```

---

## 🔒 Security

Security is a top priority in this platform:

### Authentication & Authorization
- ✅ JWT tokens with expiration
- ✅ Password hashing with bcrypt (cost factor 10)
- ✅ Secure session management
- ✅ Role-based access control (RBAC)

### Infrastructure Security
- ✅ Private subnets for backend services
- ✅ Security groups with least privilege
- ✅ Secrets managed via AWS Secrets Manager
- ✅ Encryption at rest (RDS, S3)
- ✅ Encryption in transit (TLS/SSL)

### Application Security
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Helmet.js security headers

### CI/CD Security
- ✅ Dependency scanning (Snyk, Trivy)
- ✅ Code scanning (CodeQL, Semgrep)
- ✅ Secret scanning
- ✅ Container image scanning
- ✅ SBOM generation

---

## 📚 Documentation

- **[Architecture Decision Records](docs/adr/)** - Design decisions
- **[API Documentation](http://localhost:4000/api/docs)** - Swagger/OpenAPI
- **[Terraform Guide](terraform/README.md)** - AWS deployment
- **[Docker Guide](DOCKER.md)** - Container setup
- **[CI/CD Guide](CI-CD.md)** - GitHub Actions workflows
- **[Development Plan](DEVELOPMENT_PLAN.md)** - Project roadmap

---

## 🛠️ Development

### Development Workflow

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build backend
```

### Database Management

```bash
# Access Prisma Studio (Database GUI)
cd backend
npx prisma studio

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Code Quality

```bash
# Backend linting
cd backend
npm run lint
npm run format

# Frontend linting
cd frontend
npm run lint
npm run format
```

---

## 📈 Performance

The platform is optimized for performance:

- **Frontend:**
  - Vite build optimization
  - Code splitting & lazy loading
  - React Query caching
  - Mapbox WebGL rendering
  - Tree shaking

- **Backend:**
  - Connection pooling
  - Database indexing
  - Query optimization
  - Caching strategies

- **Infrastructure:**
  - Auto-scaling ECS tasks
  - CloudFront CDN (optional)
  - Multi-AZ RDS
  - ALB connection handling

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Jarkko Tuovinen**

- 🌐 Portfolio: [jarkkotuovinen.com](https://jarkkotuovinen.com)
- 💼 LinkedIn: [linkedin.com/in/jarkko-tuovinen](https://www.linkedin.com/in/jarkko-tuovinen/)
- 🐙 GitHub: [@jarkkotuovinen](https://github.com/jarkkotuovinen)
- 📧 Email: jarkko@example.com

---

## 🙏 Acknowledgments

Built to demonstrate comprehensive full-stack development capabilities:

- ✅ **Modern Frontend Development** - React, TypeScript, Tailwind CSS
- ✅ **Enterprise Backend Architecture** - NestJS, Clean Architecture, DDD
- ✅ **Microservices Design** - Go, Python, API Gateway pattern
- ✅ **Database Engineering** - PostgreSQL, Prisma, Schema Design
- ✅ **Cloud Infrastructure** - AWS, Terraform, IaC best practices
- ✅ **DevOps Excellence** - Docker, CI/CD, Monitoring, Security
- ✅ **Geospatial Expertise** - Mapbox, GeoJSON, Spatial Analysis
- ✅ **Domain Knowledge** - SAR satellite operations, Orbital mechanics

### Technologies & Tools

Thanks to the open-source community for these amazing tools:

- [React](https://reactjs.org/) - UI library
- [NestJS](https://nestjs.com/) - Backend framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Mapbox](https://www.mapbox.com/) - Mapping platform
- [Terraform](https://www.terraform.io/) - Infrastructure as Code
- [Docker](https://www.docker.com/) - Containerization
- And many more!

---

<div align="center">

### ⭐ If you find this project useful, please consider giving it a star!

**[📖 Documentation](docs/)** • **[🐛 Report Bug](issues)** • **[✨ Request Feature](issues)**

---

**Built with ❤️ using TypeScript, React, NestJS, and AWS**

*Last Updated: October 2026*

</div>
