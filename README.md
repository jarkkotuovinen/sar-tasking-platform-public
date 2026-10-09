# SAR Tasking Platform

> **Production-grade full-stack SAR satellite tasking platform demonstrating enterprise-level software engineering**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=flat&logo=terraform&logoColor=white)](https://www.terraform.io/)

---

## 📸 Screenshots

### Dashboard & Task Management
![Dashboard](screenshot1.png)
*Real-time task queue with status tracking and interactive Mapbox GL map interface for drawing Areas of Interest (AOI)*

### Login & Authentication
![Login](sceenshot2.png)
*Secure JWT-based authentication with modern React UI and form validation*

---

## 🎯 Overview

A **comprehensive full-stack platform** for managing SAR (Synthetic Aperture Radar) satellite imaging tasks. This project demonstrates production-ready code quality, modern architecture patterns, and deep understanding of satellite operations workflows.

### What This Platform Does

- **Task Creation**: Users draw Areas of Interest (AOI) on an interactive map and configure SAR imaging parameters
- **Validation**: Automated validation of AOI size, resolution limits, time windows, and imaging feasibility
- **Scheduling**: Intelligent task scheduling based on satellite orbital mechanics and pass predictions
- **Status Tracking**: Real-time status updates through task lifecycle (VALIDATING → SCHEDULED → ACQUIRING → PROCESSING → COMPLETED)
- **Delivery Estimation**: Automatic calculation of expected delivery times based on orbital passes and processing queues
- **Multi-User Support**: Complete authentication system with role-based access control (RBAC)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Frontend (TypeScript + Vite)                      │   │
│  │  • Mapbox GL for interactive mapping                     │   │
│  │  • Zustand for state management                          │   │
│  │  • React Query for data fetching                         │   │
│  │  • Tailwind CSS for styling                              │   │
│  └────────────────────┬─────────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────┘
                          │ REST API (JSON)
┌─────────────────────────┼───────────────────────────────────────┐
│                         │  API Gateway                          │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │  NestJS Backend (TypeScript)                            │   │
│  │  • JWT Authentication & Authorization                   │   │
│  │  • Task CRUD Operations                                 │   │
│  │  • Business Logic & Validation                          │   │
│  │  • Swagger/OpenAPI Documentation                        │   │
│  └───────┬──────────────────┬──────────────────┬───────────┘   │
└──────────┼──────────────────┼──────────────────┼───────────────┘
           │                  │                  │
           │                  │                  │
┌──────────▼──────────┐┌──────▼────────┐┌────────▼──────────────┐
│  Microservice 1     ││ Microservice 2 ││  Database Layer       │
│  ┌───────────────┐  ││ ┌────────────┐ ││  ┌─────────────────┐ │
│  │  Satellite    │  ││ │   AOI      │ ││  │   PostgreSQL    │ │
│  │  Pass         │  ││ │ Validator  │ ││  │   + PostGIS     │ │
│  │  Predictor    │  ││ │  (Python)  │ ││  │                 │ │
│  │   (Go)        │  ││ │            │ ││  │  • Users        │ │
│  └───────────────┘  ││ └────────────┘ ││  │  • Tasks        │ │
│                     ││                ││  │  • AOIs         │ │
│  • TLE parsing      ││ • GeoJSON      ││  │  • Satellites   │ │
│  • Orbital calcs    ││ • Area calc    ││  │  • Passes       │ │
│  • Pass prediction  ││ • Validation   ││  │  • Products     │ │
└─────────────────────┘└────────────────┘└───────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Modern UI framework with type safety |
| | Vite | Lightning-fast build tool and dev server |
| | Tailwind CSS | Utility-first CSS framework |
| | Zustand | Lightweight state management with persistence |
| | React Query | Server state management and caching |
| | Mapbox GL JS | Interactive mapping and AOI drawing |
| | Axios | HTTP client with interceptors |
| **Backend** | NestJS 10 + TypeScript | Enterprise Node.js framework |
| | Prisma ORM | Type-safe database client |
| | Passport.js | Authentication middleware |
| | JWT | Stateless authentication tokens |
| | class-validator | DTO validation |
| | Swagger/OpenAPI | API documentation |
| **Microservices** | Go 1.21 | Satellite pass predictor (performance) |
| | Python 3.11 + FastAPI | AOI validator (geospatial libraries) |
| **Database** | PostgreSQL 15 | Primary database |
| | PostGIS | Geospatial extensions |
| **Infrastructure** | Docker + Docker Compose | Containerization |
| | AWS ECS Fargate | Container orchestration |
| | AWS RDS | Managed PostgreSQL |
| | AWS ALB | Load balancing |
| | AWS S3 | Static assets and image storage |
| | AWS Secrets Manager | Credential management |
| | AWS CloudWatch | Monitoring and logging |
| | Terraform | Infrastructure as Code |
| **CI/CD** | GitHub Actions | Automated workflows |
| | Trivy, Snyk | Security scanning |
| | CodeQL, Semgrep | Static analysis |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Docker** >= 24.x
- **Docker Compose** >= 2.x
- **Go** >= 1.21 (for microservices)
- **Python** >= 3.11 (for microservices)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd iceye-tasking-platform
```

#### 2. Start PostgreSQL Database

```bash
# Start PostgreSQL with PostGIS extension
docker-compose up -d postgres

# Verify database is running
docker-compose ps
```

#### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed database with sample data
npx prisma db seed

# Start development server
npm run start:dev
```

Backend will be available at:
- API: http://localhost:4000
- Swagger Documentation: http://localhost:4000/api/docs

#### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

#### 5. (Optional) Start Microservices

**Satellite Pass Predictor (Go):**
```bash
cd services/satellite-pass-predictor
go mod download
go run main.go
# Available at http://localhost:8001
```

**AOI Validator (Python):**
```bash
cd services/aoi-validator
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
# Available at http://localhost:8002
```

---

## 🐳 Docker Deployment

### Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- PostgreSQL: localhost:5432
- Satellite Pass Predictor: http://localhost:8001
- AOI Validator: http://localhost:8002

### Production Environment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d
```

---

## ☁️ AWS Deployment

### Infrastructure Overview

The platform deploys to AWS with:
- **Multi-AZ High Availability** (2+ availability zones)
- **Auto-scaling** ECS Fargate services
- **Managed PostgreSQL** with RDS Multi-AZ
- **Application Load Balancer** with SSL/TLS
- **CloudWatch** monitoring and alarms
- **Secrets Manager** for credential management

### Cost Estimates

| Environment | Monthly Cost | Configuration |
|------------|--------------|---------------|
| **Development** | $150-200 | Single NAT, t3.micro RDS, 1 task per service, Fargate Spot |
| **Staging** | $300-400 | Multi-AZ NAT, t3.small RDS, 2 tasks per service |
| **Production** | $600-800 | Multi-AZ NAT, r5.large RDS, 3+ tasks, auto-scaling |

### Deployment Steps

#### 1. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region
```

#### 2. Create Terraform Backend

```bash
# Create S3 bucket for state
aws s3 mb s3://sar-tasking-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket sar-tasking-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for locking
aws dynamodb create-table \
  --table-name sar-tasking-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

#### 3. Build and Push Docker Images

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Tag and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag sar-tasking-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/sar-tasking-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/sar-tasking-backend:latest
```

#### 4. Deploy Infrastructure with Terraform

```bash
cd terraform/environments/dev

# Copy configuration template
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars

# Initialize Terraform
terraform init -backend-config=backend.tfvars

# Review plan
terraform plan -var-file=terraform.tfvars

# Apply infrastructure
terraform apply -var-file=terraform.tfvars
```

#### 5. Access Deployed Application

```bash
# Get application URL
terraform output alb_url

# Get database connection info
terraform output -json | jq -r '.connection_info.value'
```

**See [terraform/README.md](terraform/README.md) for detailed AWS deployment guide.**

---

## 🗄️ Database Schema

```
┌─────────────────┐       ┌──────────────────┐
│  Organizations  │       │      Users       │
├─────────────────┤       ├──────────────────┤
│ id              │◄──┐   │ id               │
│ name            │   └───│ organizationId   │
│ apiKey          │       │ email            │
│ isActive        │       │ passwordHash     │
│ createdAt       │       │ name             │
└─────────────────┘       │ role             │
                          │ isActive         │
                          │ createdAt        │
                          └────────┬─────────┘
                                   │
                                   │ 1:N
                                   │
                          ┌────────▼─────────┐
                          │      Tasks       │
                          ├──────────────────┤
                          │ id               │
                          │ userId           │
                          │ status           │◄────┐
                          │ priority         │     │
                          │ resolution       │     │ 1:1
                          │ polarization     │     │
                          │ imagingMode      │     │
                    ┌────►│ aoiId            │     │
                    │     │ satellitePassId  │────►│
                    │ 1:1 │ productId        │─┐   │
                    │     │ estimatedDelivery│ │   │
                    │     │ createdAt        │ │   │
                    │     └──────────────────┘ │   │
                    │                          │   │
         ┌──────────┴──────┐     ┌────────────▼───▼──────┐
         │  AreasOfInterest│     │   SatellitePasses     │
         ├─────────────────┤     ├───────────────────────┤
         │ id              │     │ id                    │
         │ geometry        │     │ satelliteId           │
         │ area            │     │ aos (Acquisition Of   │
         │ bounds          │     │      Signal)          │
         │ createdAt       │     │ los (Loss Of Signal)  │
         └─────────────────┘     │ maxElevation          │
                                 │ createdAt             │
                                 └───────────┬───────────┘
                                             │
                                             │ N:1
                                             │
                                 ┌───────────▼───────────┐
                                 │     Satellites        │
                                 ├───────────────────────┤
                                 │ id                    │
                                 │ name                  │
                                 │ tle1 (Two-Line        │
                                 │ tle2  Elements)       │
                                 │ isActive              │
                                 │ lastUpdated           │
                                 └───────────────────────┘

         ┌─────────────────┐
         │     Products    │
         ├─────────────────┤
         │ id              │
         │ taskId          │
         │ imageUrl        │
         │ quicklookUrl    │
         │ metadata        │
         │ processingLevel │
         │ deliveredAt     │
         └─────────────────┘
```

**Key Relationships:**
- Users belong to Organizations
- Each User can have many Tasks
- Each Task has one Area of Interest (AOI)
- Tasks are linked to Satellite Passes for scheduling
- Completed Tasks produce Products (delivered images)
- Satellites have orbital parameters (TLE) for pass prediction

---

## 🔐 Authentication & Security

### JWT Authentication Flow

```
┌────────┐                  ┌─────────┐                 ┌──────────┐
│ Client │                  │ Backend │                 │ Database │
└───┬────┘                  └────┬────┘                 └─────┬────┘
    │                            │                            │
    │  POST /auth/register       │                            │
    ├───────────────────────────►│                            │
    │  { email, password, name } │   Hash password (bcrypt)   │
    │                            ├────────────────────────────►
    │                            │   Save user                │
    │                            │◄───────────────────────────┤
    │  { user, access_token }    │                            │
    │◄───────────────────────────┤                            │
    │                            │                            │
    │  POST /auth/login          │                            │
    ├───────────────────────────►│   Verify credentials       │
    │  { email, password }       ├────────────────────────────►
    │                            │◄───────────────────────────┤
    │                            │   Generate JWT             │
    │  { access_token }          │   (15min expiry)           │
    │◄───────────────────────────┤                            │
    │                            │                            │
    │  GET /tasks                │                            │
    │  Authorization: Bearer ... │   Verify JWT               │
    ├───────────────────────────►│   Extract user ID          │
    │                            ├────────────────────────────►
    │                            │   Fetch user's tasks       │
    │  { tasks: [...] }          │◄───────────────────────────┤
    │◄───────────────────────────┤                            │
```

### Security Features

- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **JWT Tokens**: Short-lived access tokens (15 minutes)
- ✅ **HTTP-Only Cookies**: Refresh tokens stored securely
- ✅ **Role-Based Access Control**: USER, ADMIN, OPERATOR roles
- ✅ **Request Validation**: class-validator DTOs
- ✅ **CORS Configuration**: Whitelisted origins
- ✅ **Rate Limiting**: Prevent brute-force attacks
- ✅ **SQL Injection Protection**: Prisma parameterized queries
- ✅ **XSS Protection**: Input sanitization
- ✅ **Secrets Management**: AWS Secrets Manager in production
- ✅ **TLS/SSL**: HTTPS with ACM certificates in production

---

## 🧪 Testing

### Test Coverage

```
┌─────────────────────┬──────────┬────────────┬──────────┐
│ Component           │ Unit     │ Integration│ E2E      │
├─────────────────────┼──────────┼────────────┼──────────┤
│ Backend Services    │   85%    │    70%     │   60%    │
│ Frontend Components │   75%    │    65%     │   55%    │
│ Microservices       │   80%    │    N/A     │   N/A    │
└─────────────────────┴──────────┴────────────┴──────────┘
```

### Running Tests

**Backend:**
```bash
cd backend

# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

**Frontend:**
```bash
cd frontend

# Unit tests
npm run test

# Coverage report
npm run test:coverage
```

**Microservices:**
```bash
# Go service
cd services/satellite-pass-predictor
go test ./... -v

# Python service
cd services/aoi-validator
pytest tests/ -v --cov
```

---

## 📊 API Documentation

### Swagger/OpenAPI

Interactive API documentation available at: **http://localhost:4000/api/docs**

### Key Endpoints

#### Authentication
```http
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login and get JWT token
POST   /api/auth/refresh     # Refresh access token
GET    /api/users/me         # Get current user profile
```

#### Task Management
```http
POST   /api/tasks            # Create new SAR tasking request
GET    /api/tasks            # Get all user tasks
GET    /api/tasks/:id        # Get specific task details
PATCH  /api/tasks/:id        # Update task (status, priority)
DELETE /api/tasks/:id        # Delete task
```

#### Satellites & Passes
```http
GET    /api/satellites       # List available satellites
GET    /api/satellites/:id/passes  # Get predicted passes for satellite
POST   /api/passes/predict   # Predict passes for AOI and time window
```

### Example Request

**Create Task:**
```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "aoi": {
      "type": "Polygon",
      "coordinates": [[[24.9384, 60.1699], [24.9484, 60.1699],
                       [24.9484, 60.1799], [24.9384, 60.1799],
                       [24.9384, 60.1699]]]
    },
    "resolution": "STRIPMAP",
    "polarization": "VV",
    "imagingMode": "RIGHT_LOOKING",
    "priority": "MEDIUM",
    "startTime": "2024-10-15T00:00:00Z",
    "endTime": "2024-10-20T23:59:59Z"
  }'
```

**Response:**
```json
{
  "id": "cm2abc123xyz",
  "userId": "cm2user123",
  "status": "VALIDATING",
  "priority": "MEDIUM",
  "resolution": "STRIPMAP",
  "polarization": "VV",
  "estimatedDelivery": "2024-10-16T14:30:00Z",
  "aoi": {
    "area": 0.82,
    "geometry": { ... }
  },
  "createdAt": "2024-10-15T10:00:00Z"
}
```

---

## 🎨 Frontend Features

### Interactive Mapping
- **Mapbox GL JS** integration with drawing tools
- Draw polygons for Areas of Interest (AOI)
- Satellite ground track visualization
- Pass prediction overlays
- Real-time coordinate display

### State Management
- **Zustand** for global state (authentication, user profile)
- **React Query** for server state (tasks, satellites, passes)
- Persistent authentication across sessions
- Optimistic UI updates

### Form Validation
- Real-time validation of SAR parameters
- AOI size constraints (1-10,000 km²)
- Resolution-specific limits (Spotlight: 100 km², Stripmap: 1,000 km²)
- Time window validation
- Error feedback with clear messages

---

## 🛠️ Development

### Project Structure

```
iceye-tasking-platform/
├── backend/                      # NestJS backend
│   ├── src/
│   │   ├── auth/                # Authentication module
│   │   ├── users/               # User management
│   │   ├── tasks/               # Task CRUD operations
│   │   ├── satellites/          # Satellite data
│   │   ├── passes/              # Pass prediction
│   │   ├── products/            # Image products
│   │   ├── prisma/              # Database service
│   │   └── common/              # Guards, decorators, filters
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── test/                    # E2E tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── api/                 # API client
│   │   ├── store/               # Zustand stores
│   │   ├── types/               # TypeScript types
│   │   ├── features/
│   │   │   ├── auth/           # Login, register pages
│   │   │   └── tasks/          # Dashboard, task management
│   │   └── components/         # Reusable components
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── services/                     # Microservices
│   ├── satellite-pass-predictor/ # Go service
│   │   ├── main.go
│   │   ├── go.mod
│   │   └── Dockerfile
│   └── aoi-validator/           # Python service
│       ├── main.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── terraform/                    # AWS Infrastructure
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── modules/
│   │   ├── vpc/
│   │   ├── security/
│   │   ├── alb/
│   │   ├── rds/
│   │   ├── ecs/
│   │   └── monitoring/
│   └── environments/
│       ├── dev/
│       ├── staging/
│       └── prod/
│
├── .github/
│   └── workflows/
│       ├── deploy.yml           # CI/CD pipeline
│       └── pr-validation.yml    # PR checks
│
├── docs/                         # Additional documentation
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
└── README.md                    # This file
```

### Environment Variables

**Backend (.env):**
```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sar_tasking?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="15m"

# API
PORT=4000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Microservices
SATELLITE_PASS_SERVICE_URL="http://localhost:8001"
AOI_VALIDATOR_SERVICE_URL="http://localhost:8002"
```

**Frontend (.env):**
```bash
VITE_API_URL="http://localhost:4000"
VITE_MAPBOX_TOKEN="your-mapbox-token"
```

### Code Quality

**ESLint + Prettier:**
```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run format
```

**Type Checking:**
```bash
# Check TypeScript types
npm run type-check
```

---

## 📈 Monitoring & Observability

### CloudWatch Dashboards

Production deployments include comprehensive monitoring:

- **ECS Metrics**: CPU, memory, task count
- **ALB Metrics**: Request count, latency, error rates
- **RDS Metrics**: Connections, CPU, storage, IOPS
- **Custom Metrics**: Task creation rate, validation failures

### Alarms

Automatic alerts configured for:
- High CPU usage (>80%)
- High memory usage (>80%)
- Database connection exhaustion
- ALB unhealthy targets
- 5xx error rate spike
- Task processing failures

### Logging

Structured JSON logs sent to CloudWatch:
```json
{
  "level": "info",
  "timestamp": "2024-10-15T10:30:00Z",
  "service": "backend",
  "requestId": "abc123",
  "userId": "cm2user123",
  "action": "CREATE_TASK",
  "taskId": "cm2task456",
  "duration": 234,
  "status": "success"
}
```

---

## 🚢 CI/CD Pipeline

### GitHub Actions Workflows

**Pull Request Validation:**
- Lint check (ESLint)
- Type check (TypeScript)
- Unit tests with coverage
- Integration tests
- Security scanning (Trivy, Snyk, CodeQL, Semgrep)
- Docker image build test

**Deployment Pipeline:**
```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Commit    │────►│   Build &    │────►│   Security    │
│   to main   │     │   Test       │     │   Scan        │
└─────────────┘     └──────────────┘     └───────┬───────┘
                                                  │
                                                  ▼
                    ┌──────────────┐     ┌───────────────┐
                    │   Deploy to  │◄────│  Push to ECR  │
                    │   ECS        │     │               │
                    └──────────────┘     └───────────────┘
```

**Environments:**
- **dev**: Auto-deploy on push to `main`
- **staging**: Auto-deploy on push to `staging`
- **prod**: Manual approval required

See [CI-CD.md](CI-CD.md) for detailed pipeline documentation.

---

## 🎓 Learning Resources

### SAR Imaging Concepts
- [SAR Handbook](https://www.esa.int/ESA_Multimedia/Files/2021/03/SAR_Handbook)
- [Sentinel-1 User Guide](https://sentinel.esa.int/web/sentinel/user-guides/sentinel-1-sar)

### Orbital Mechanics
- [Two-Line Element Sets](https://www.space-track.org/documentation#tle)
- [SGP4 Propagator](https://celestrak.org/NORAD/documentation/spacetrk.pdf)

### Technology Documentation
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow conventional commit messages
- Ensure CI/CD pipeline passes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Jarkko Tuovinen**

This project was created as a portfolio demonstration of full-stack development capabilities, modern cloud architecture, and SAR domain knowledge.

---

## 🙏 Acknowledgments

- SAR satellite operators for public TLE data
- Open-source community for excellent tools and libraries
- Mapbox for mapping infrastructure
- AWS for cloud services documentation

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check the [documentation](docs/)
- Review API documentation at `/api/docs`

---

**Built with ❤️ using TypeScript, NestJS, React, and AWS**
