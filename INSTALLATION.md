# PharmaSys Installation Guide

## Prerequisites

Before installing PharmaSys, make sure you have the following installed:

### Required

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/))
- **Git** ([Download](https://git-scm.com/))

### Optional

- **Docker & Docker Compose** (for containerized deployment)
- **Postman** (for API testing)
- **VS Code** (recommended IDE)

## Installation Steps

### 1. Clone or Extract Project

```bash
# If cloning
git clone <repository-url>
cd pharmasys

# Or if extracted
cd pharmasys
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:

- Express.js
- Prisma ORM
- TypeScript
- Zod (validation)
- CORS
- And other dependencies

### 3. Install Frontend Dependencies (Optional)

```bash
cd ../frontend
npm install
```

### 4. Configure Database

#### Option A: Local PostgreSQL

1. **Start PostgreSQL Server**

   ```bash
   # On Windows (if installed via installer)
   # PostgreSQL should start automatically

   # On macOS
   brew services start postgresql

   # On Linux
   sudo systemctl start postgresql
   ```

2. **Create Database**

   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE pharmasys_db;

   # Exit
   \q
   ```

#### Option B: Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name pharmasys-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=pharmasys_db \
  -p 5432:5432 \
  -d postgres:16
```

### 5. Create Environment File

Navigate to backend directory:

```bash
cd backend
```

Create `.env` file:

```bash
# Copy from example
cp .env.example .env

# Edit .env (use your editor)
# nano .env
# or
# code .env
```

**Important:** Update the DATABASE_URL with your connection:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/pharmasys_db
PORT=4000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
LOG_LEVEL=debug
DEFAULT_PHARMACY_ID=ph-001
```

### 6. Setup Database Schema

```bash
cd backend

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

You should see:

```
✓ Your database has been successfully provisioned
```

### 7. Seed Sample Data (Optional)

```bash
npm run db:seed
```

This creates:

- Sample pharmacy
- 15 products with categories
- 15 product batches
- Main branch
- Test data

### 8. Start Backend Server

```bash
npm run dev
```

You should see:

```
🚀 Server running on http://localhost:4000
📡 API available at http://localhost:4000/api
💉 PharmaSys Backend Started
```

### 9. Test Backend

Open in browser or Postman:

```
GET http://localhost:4000/api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-04-12T10:30:00.000Z"
}
```

## Frontend Setup (Optional)

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:5173`

## Database Operations

### View Database with Prisma Studio

```bash
# In backend directory
npm run db:studio
```

Opens an interactive database viewer at `http://localhost:5555`

### Reset Database

```bash
# WARNING: This deletes all data
npm run db:push -- --force-reset

# Then reseed
npm run db:seed
```

### Generate Migrations (after schema changes)

```bash
npm run db:generate
npm run db:push
```

## API Testing

### Using Curl

```bash
# List products
curl -X GET http://localhost:4000/api/products \
  -H "x-user-id: user-123" \
  -H "x-user-role: admin" \
  -H "x-pharmacy-id: ph-001"
```

### Using Postman

1. Open Postman
2. Import collection or create new request
3. Set URL: `http://localhost:4000/api/products`
4. Add Headers:
   - `x-user-id: user-123`
   - `x-user-role: admin`
   - `x-pharmacy-id: ph-001`
5. Click "Send"

### Using Bruno

Similar to Postman, create environment with:

```
url: http://localhost:4000/api
userId: user-123
userRole: admin
pharmacyId: ph-001
```

## Docker Deployment

### Option 1: Docker Compose

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Manual Docker

```bash
# Build backend image
cd backend
docker build -t pharmasys-backend:latest .

# Run container
docker run -p 4000:4000 \
  --env-file .env \
  --link pharmasys-db:db \
  pharmasys-backend:latest
```

## Production Deployment

### Build for Production

```bash
cd backend

# Build
npm run build

# Start
npm start
```

### Environment Configuration

Set environment variables in production:

```bash
export NODE_ENV=production
export DATABASE_URL=postgresql://prod-user:prod-password@prod-host:5432/pharmasys
export PORT=4000
export JWT_SECRET=very-secure-production-secret
```

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/index.js --name pharmasys-backend

# View logs
pm2 logs pharmasys-backend

# Monitor
pm2 monit
```

### Using systemd

Create `/etc/systemd/system/pharmasys-backend.service`:

```ini
[Unit]
Description=PharmaSys Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/pharmasys/backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
Environment="NODE_ENV=production"
Environment="DATABASE_URL=postgresql://..."

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pharmasys-backend
sudo systemctl start pharmasys-backend
sudo systemctl status pharmasys-backend
```

## Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :4000
kill -9 <PID>
```

### Database Connection Error

Check connection string in `.env`:

```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

Verify PostgreSQL is running:

```bash
# Test connection
psql -U postgres -h localhost -d pharmasys_db
```

### Prisma Generate Error

```bash
# Clear cache and regenerate
rm -rf node_modules/.prisma
npm run db:generate
```

### Seed Script Errors

```bash
# Check database is empty
npm run db:studio

# If needed, reset and reseed
npm run db:push -- --force-reset
npm run db:seed
```

### TypeScript Errors

```bash
# Clear cache
rm -rf dist
npm run build

# If still issues
npm install
npm run build
```

## Next Steps

1. ✅ Backend is running
2. ✅ Database is configured
3. 📖 Read API documentation
4. 🧪 Test endpoints with GET /api/health
5. 🚀 Start building your features

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Compile TypeScript
npm start              # Run production build

# Database
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to DB
npm run db:seed       # Seed sample data
npm run db:studio     # Open visual DB editor

# Others
npm test              # Run tests
npm run lint          # Lint code
npm run type-check    # Check TypeScript
```

## Support Resources

- Backend README: `backend/README.md`
- API Documentation: `backend/README.md` (Endpoints section)
- Database Schema: `backend/prisma/schema.prisma`
- Example Environment: `backend/.env.example`
- Task Roadmap: `task.md`
- Backend Status: `BACKEND_STATUS.md`

## Health Check

Test if everything is working:

```bash
# Backend health
curl http://localhost:4000/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-04-12T10:30:00.000Z"}
```

## Cleanup

If something goes wrong:

```bash
# Remove containers
docker-compose down -v

# Remove node modules
rm -rf node_modules

# Start fresh
npm install
npm run db:push
npm run db:seed
npm run dev
```

---

**Installation Complete! Happy Coding! 🎉**

For questions or issues, refer to the documentation files or check the README.md in each directory.
