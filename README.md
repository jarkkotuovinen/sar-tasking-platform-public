# SAR Tasking Platform

A production-grade full-stack satellite tasking platform built for portfolio demonstration.

## 🎯 Overview

Complete end-to-end SAR satellite tasking system with:
- User authentication & authorization
- Interactive map-based AOI drawing
- Task submission with SAR-specific parameters
- Real-time task queue management
- Production-ready architecture

## 🏗️ Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │ ───> │   NestJS     │ ───> │  PostgreSQL  │
│ React + TS   │ HTTP │   Backend    │      │  + Prisma    │
│ Tailwind CSS │ <─── │   REST API   │ <─── │   Database   │
└──────────────┘      └──────────────┘      └──────────────┘
```

## 📦 Tech Stack

### Backend
- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL 15 + Prisma ORM
- **Auth:** JWT with Passport.js
- **Validation:** class-validator
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State:** Zustand with persistence
- **Data Fetching:** React Query
- **HTTP Client:** Axios
- **Mapping:** Mapbox GL + Mapbox Draw
- **Geospatial:** Turf.js

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Database:** PostgreSQL 15
- **Reverse Proxy:** Nginx (production)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### 1. Clone and Setup

```bash
git clone <repository-url>
cd sar-tasking-platform
```

### 2. Start Database

```bash
docker-compose up -d postgres
```

### 3. Setup Backend

```bash
cd backend
npm install
npm run prisma:migrate
npm run start:dev
```

Backend will be available at:
- API: http://localhost:4000/api
- Docs: http://localhost:4000/api/docs

### 4. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: http://localhost:3000

## 🎮 Usage

### 1. Register/Login
- Navigate to http://localhost:3000
- Create an account or login
- You'll be redirected to the dashboard

### 2. Create a Task
1. Click the polygon tool (top-left of map)
2. Draw an Area of Interest (AOI) by clicking points on the map
3. Close the polygon by clicking the first point again
4. Configure SAR parameters in the sidebar:
   - Resolution Mode (Spotlight, Stripmap, ScanSAR)
   - Polarization (HH, VV, HV, VH)
   - Priority (Low, Medium, High, Urgent)
5. Click "Submit Tasking Request"

### 3. View Tasks
- Tasks appear in the sidebar queue
- Status updates automatically (PENDING → VALIDATING → SCHEDULED)
- View task details, validation errors, and timestamps

## 📁 Project Structure

```
iceye-tasking-platform/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── tasks/             # Task CRUD operations
│   │   ├── prisma/            # Database service
│   │   └── common/            # Shared utilities
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/               # API client & endpoints
│   │   ├── features/
│   │   │   ├── auth/         # Login/Register pages
│   │   │   └── tasks/        # Dashboard, Map, Forms
│   │   ├── store/            # Zustand stores
│   │   ├── types/            # TypeScript types
│   │   └── App.tsx           # Main app with routing
│   └── Dockerfile
│
├── infrastructure/
│   └── docker-compose.yml
│
└── docs/
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile

### Tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks` - Get all user tasks
- `GET /api/tasks/:id` - Get task by ID
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 💾 Database Schema

### Key Models
- **User** - Authentication & profile
- **Organization** - Multi-tenancy support
- **Task** - SAR imaging requests with full lifecycle
- **AreaOfInterest** - Spatial data (GeoJSON polygons)
- **Satellite** - Fleet management
- **SatellitePass** - Predicted satellite passes
- **Product** - Delivered SAR images

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:cov        # Generate coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                # Run unit tests
npm run test:e2e        # Run Playwright E2E tests
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Security Features

- JWT authentication with secure token storage
- Password hashing with bcrypt
- CORS configuration
- Input validation & sanitization
- SQL injection prevention (Prisma)
- Environment variable management
- API rate limiting (optional)

## 🎯 Key Features

### Validation & Business Logic
- AOI size validation (1-10,000 km²)
- Resolution-specific area limits:
  - Spotlight: max 100 km²
  - Stripmap: max 1,000 km²
  - ScanSAR: unlimited
- Time window validation (max 30 days)
- Future date validation
- Estimated delivery calculation based on priority

### SAR Domain Features
- Resolution modes: Spotlight, Stripmap, ScanSAR
- Polarization: HH, VV, HV, VH
- Look direction: Left/Right
- Priority levels with delivery estimates
- Task lifecycle management
- Status tracking & updates

## 📊 What This Demonstrates

✅ **Full-Stack TypeScript** - End-to-end type safety
✅ **Modern Backend** - NestJS with clean architecture
✅ **Database Design** - 8-model schema with relationships
✅ **Authentication** - Secure JWT implementation
✅ **REST API** - RESTful design with Swagger docs
✅ **React Expertise** - Hooks, state management, routing
✅ **Responsive UI** - Tailwind CSS with modern design
✅ **Geospatial** - Mapbox integration, polygon drawing
✅ **DevOps** - Docker containerization
✅ **SAR Domain** - Understanding of satellite imaging workflows

## 👤 Author

**Jarkko Tuovinen**
- GitHub: [@jarkkotuovinen](https://github.com/jarkkotuovinen)
- LinkedIn: [jarkko-tuovinen](https://www.linkedin.com/in/jarkko-tuovinen/)

## 📄 License

This is a demo project for interview purposes.

## 🙏 Acknowledgments

Built to demonstrate:
- Full-stack development capabilities
- SAR domain knowledge
- Production-ready code quality
- Modern software engineering practices

---

**Status:** Production-Ready Demo ✅
**Completion:** 100%
**Build Time:** ~3 hours
**Lines of Code:** ~3,000+
