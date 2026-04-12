# PharmaSys 💊

A comprehensive **Pharmacy Management System** with modern web technologies. Complete inventory management, POS system, sales tracking, and analytics.

## 🎯 Features

### Core Features

✨ **Inventory Management**

- Product catalog with batch tracking
- Expiry date management (FIFO/LIFO)
- Low stock alerts
- Damaged goods tracking

💰 **Point of Sale (POS)**

- Fast checkout system
- Barcode scanning support
- Multiple payment methods
- Receipt generation

👥 **Customer Management**

- Customer profiles
- Loyalty points system
- Credit/debt tracking
- Purchase history

📊 **Sales & Analytics**

- Real-time dashboard
- Advanced reporting
- Sales metrics
- Revenue tracking

🏢 **Multi-Branch Support**

- Branch management
- Inter-branch transfers
- Branch-level reporting
- Staff per branch

📱 **Modern UI**

- Responsive design
- Real-time updates
- Dark/light mode
- Multiple languages (future)

## 🏗️ Architecture

### Technology Stack

**Backend**

- Node.js + Express.js (TypeScript)
- PostgreSQL + Prisma ORM
- Zod validation
- CORS & Security

**Frontend**

- React + Vite
- TypeScript
- Tailwind CSS
- ShadCN UI Components
- SQLite (local database)

**DevOps**

- Docker & Docker Compose
- Nodemon for development
- npm scripts for automation

### System Architecture

```
PharmaSys
├── Backend (Node.js + Express)
│   ├── 50+ API endpoints
│   ├── 19 database models
│   ├── 3 business logic controllers
│   └── Comprehensive validation
│
├── Frontend (React + Vite)
│   ├── 20+ pages/views
│   ├── 30+ UI components
│   ├── Real-time synchronization
│   └── Offline support (SQLite)
│
└── Database
    └── PostgreSQL (Production)
        └── SQLite (Frontend/Offline)
```

## 📋 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Git

### Installation

```bash
# 1. Clone project
git clone <repo-url>
cd pharmasys

# 2. Backend Setup
cd backend
npm install
cp .env.example .env

# 3. Configure Database
# Edit .env with your PostgreSQL connection string
# DATABASE_URL=postgresql://user:password@localhost:5432/pharmasys_db

# 4. Initialize Database
npm run db:generate
npm run db:push
npm run db:seed

# 5. Start Backend
npm run dev

# Backend runs at: http://localhost:4000

# 6. Frontend Setup (in new terminal)
cd ../frontend
npm install
npm run dev

# Frontend runs at: http://localhost:5173
```

**Detailed Setup Guide:** See [INSTALLATION.md](INSTALLATION.md)

## 📂 Project Structure

```
pharmasys/
├── backend/                    # Express API
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Auth & error handling
│   │   ├── routes/           # API endpoints
│   │   ├── types/            # TypeScript interfaces
│   │   ├── lib/              # Utilities & constants
│   │   ├── db.ts             # Prisma client
│   │   └── index.ts          # Server entry
│   ├── prisma/
│   │   ├── schema.prisma     # Database models
│   │   └── seed.ts           # Sample data
│   ├── README.md             # Backend docs
│   └── package.json
│
├── frontend/                  # React App
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── db/              # SQLite setup
│   │   └── main.tsx         # Entry point
│   ├── vite.config.ts
│   └── package.json
│
├── INSTALLATION.md           # Setup guide
├── API_GUIDE.md             # API documentation
├── BACKEND_STATUS.md        # Implementation status
├── task.md                  # Development roadmap
├── docker-compose.yml       # Docker configuration
└── README.md               # This file
```

## 🚀 API Endpoints

### Base URL

```
http://localhost:4000/api
```

### Main Endpoints

| Resource   | GET | POST | PUT | DELETE |
| ---------- | --- | ---- | --- | ------ |
| Products   | ✅  | ✅   | ✅  | ✅     |
| Categories | ✅  | ✅   | ✅  | ✅     |
| Customers  | ✅  | ✅   | ✅  | ✅     |
| Sales      | ✅  | ✅   | ✅  | ✅     |
| Suppliers  | ✅  | ✅   | ✅  | ✅     |
| Users      | ✅  | ✅   | ✅  | ✅     |
| Dashboard  | ✅  | -    | -   | -      |
| Reports    | ✅  | -    | -   | -      |

**Total: 50+ endpoints**

See [API_GUIDE.md](API_GUIDE.md) for complete documentation.

## 🔐 Authentication

Header-based authentication:

```bash
curl -X GET http://localhost:4000/api/products \
  -H "x-user-id: user-123" \
  -H "x-user-role: admin" \
  -H "x-pharmacy-id: ph-001"
```

**Roles:**

- `admin` - Full system access
- `manager` - Branch management
- `pharmacist` - Inventory & sales
- `cashier` - Sales only

## 📊 Database Models

19 models in PostgreSQL:

- Pharmacy, User, Branch, BranchUser
- Product, ProductBatch, Category
- Customer, Sale, SaleItem, SalePayment
- Supplier, PurchaseOrder, PurchaseOrderItem
- StockAdjustment, CustomerDebt
- Attendance, AuditLog, SyncLog, SyncMeta
- RolePermission

See [schema.prisma](backend/prisma/schema.prisma) for details.

## 📚 Documentation

- **[INSTALLATION.md](INSTALLATION.md)** - Complete setup guide
- **[API_GUIDE.md](API_GUIDE.md)** - API documentation with examples
- **[Backend README](backend/README.md)** - Backend details
- **[task.md](task.md)** - Development roadmap
- **[BACKEND_STATUS.md](BACKEND_STATUS.md)** - Implementation status

## 🧪 Development

### Available Scripts

**Backend:**

```bash
npm run dev              # Development server
npm run build           # Build for production
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to DB
npm run db:seed       # Seed sample data
npm run db:studio     # Visual DB editor
```

**Frontend:**

```bash
npm run dev              # Development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run test           # Run tests
npm run type-check    # TypeScript check
```

## 🐳 Docker

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### For Production

```bash
# Build image
docker build -t pharmasys-backend:latest ./backend

# Run with environment file
docker run --env-file .env pharmasys-backend:latest
```

## 📈 Status

### Phase 1: Core Features ✅

- [x] Backend API (50+ endpoints)
- [x] Database models (19 models)
- [x] Authentication & authorization
- [x] Product management
- [x] Sales management
- [x] Inventory tracking
- [x] Reporting & analytics

### Phase 2: Advanced Features 🔄

- [ ] JWT authentication
- [ ] Purchase order workflows
- [ ] Advanced inventory
- [ ] Report exports (PDF, Excel)
- [ ] Email notifications

### Phase 3: Enterprise Features 📋

- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Third-party integrations
- [ ] Mobile app
- [ ] Payment gateway

See [task.md](task.md) for detailed roadmap.

## 🤝 Contributing

### Code Style

- TypeScript everywhere
- ESLint configured
- Prettier for formatting
- Zod for validation

### Adding Features

1. Update database schema if needed
2. Generate Prisma client
3. Create controller/logic
4. Add routes
5. Update this README

### Testing

1. Test locally with `npm run dev`
2. Test API with provided headers
3. Check database with `npm run db:studio`

## 🐛 Troubleshooting

### Backend Issues

- Check `.env` file configuration
- Verify PostgreSQL is running
- Run `npm run db:generate` after schema changes
- Check error logs in terminal

### Frontend Issues

- Clear browser cache
- Run `npm install` again
- Check browser console for errors
- Verify API endpoint in config

### Database Issues

- View with `npm run db:studio`
- Reset: `npm run db:push -- --force-reset`
- Reseed: `npm run db:seed`

## 📞 Support

For issues or questions:

1. **Check Documentation:**
   - INSTALLATION.md - Setup issues
   - API_GUIDE.md - API usage
   - task.md - Roadmap & TODOs

2. **Review Code:**
   - backend/README.md
   - Source code comments
   - Prisma schema

3. **Debug:**
   - Backend logs: `npm run dev` output
   - Database: `npm run db:studio`
   - Network: Browser DevTools

## 📄 License

Private - PharmaSys © 2026

---

## 🎉 Quick Links

- [Setup Guide](INSTALLATION.md)
- [API Documentation](API_GUIDE.md)
- [Backend Details](backend/README.md)
- [Development Roadmap](task.md)
- [Implementation Status](BACKEND_STATUS.md)

---

**Built with ❤️ for pharmacy management**

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** April 2026
