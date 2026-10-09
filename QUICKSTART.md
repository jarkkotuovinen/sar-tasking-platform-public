# Quick Start Guide

## Prerequisites
- Node.js 18+
- Docker Desktop (running)
- npm

## Step-by-Step Setup

### 1. Start PostgreSQL Database
```bash
cd /Users/jarkko/Desktop/iceye/sar-tasking-platform
docker-compose up -d postgres
```

Wait ~10 seconds for PostgreSQL to be ready.

### 2. Setup Backend

```bash
cd backend
npm install
npm run prisma:init        # Initialize database with schema
npm run start:dev          # Start backend server
```

**Note:** Prisma 8 automatically generates the client - no separate generate step needed!

Backend will start at:
- **API:** http://localhost:4000/api
- **Docs:** http://localhost:4000/api/docs

### 3. Setup Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at: **http://localhost:3000**

## First Use

1. **Register** a new account at http://localhost:3000/register
2. **Login** with your credentials
3. You'll be redirected to the dashboard

## Using the Application

### Create a Task:

1. **Draw AOI:**
   - Click the polygon tool (⬜ icon, top-left of map)
   - Click on the map to place polygon vertices
   - Click the first point again to close the polygon

2. **Configure Parameters:**
   - Resolution Mode: Choose Spotlight, Stripmap, or ScanSAR
   - Polarization: VV, HH, VH, or HV
   - Priority: Low, Medium, High, or Urgent

3. **Submit:**
   - Click "Submit Tasking Request"
   - Task will appear in the sidebar queue

### View Tasks:

- Tasks appear immediately with "VALIDATING" status
- After ~2 seconds, status changes to "SCHEDULED"
- View task details, area, and validation warnings

## Troubleshooting

### Database connection errors:
```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose restart postgres
```

### Frontend build errors:
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Backend errors:
```bash
cd backend
rm -rf node_modules dist
npm install
npm run prisma:generate
npm run start:dev
```

## API Testing

You can test the API directly at: http://localhost:4000/api/docs

Or use cURL:

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Next Steps

- Explore the Swagger API docs: http://localhost:4000/api/docs
- Try creating tasks with different parameters
- Test validation by drawing very large or small AOIs
- Check the database with Prisma Studio: `npm run prisma:studio`

## Stop Everything

```bash
# Stop backend: Ctrl+C in backend terminal
# Stop frontend: Ctrl+C in frontend terminal

# Stop database
docker-compose down
```

---

**Status:** Ready to Run! 🚀
