# PharmaSys Backend

Advanced Pharmacy Management System Backend built with Express, TypeScript, and Prisma ORM.

## Features

✨ **Core Features**

- Product & Inventory Management (with batch tracking and expiry dates)
- Point of Sale (POS) System
- Customer Management & Loyalty Points
- Sales & Transaction Management
- Purchase Order Management
- Supplier Management
- User & Role Management
- Stock Adjustments & Tracking
- Multi-branch Support
- Customer Debt Management

🔐 **Security**

- User Authentication & Authorization
- Role-Based Access Control (Admin, Pharmacist, Cashier, Manager)
- Pharmacy Isolation (Multi-tenant ready)
- Request logging & audit trails

📊 **Analytics**

- Dashboard with key metrics
- Sales reports & metrics
- Inventory status reports
- Customer purchase history
- Top customers analytics

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Package Manager**: NPM

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone and navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Setup database**

   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Seed initial data (optional)**

   ```bash
   npm run db:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

Server will run at `http://localhost:4000`

## Available Scripts

```bash
npm run dev              # Start development server with hot reload
npm run build           # Compile TypeScript to JavaScript
npm start              # Run production build
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema changes to database
npm run db:seed       # Seed database with initial data
npm run db:studio     # Open Prisma Studio (visual database viewer)
```

## API Documentation

### Base URL

```
http://localhost:4000/api
```

### Required Headers

All API requests (except `/api/health`) require these headers:

```
x-user-id: user-123          # Current user ID
x-user-role: admin           # User role (admin|pharmacist|cashier|manager)
x-pharmacy-id: ph-001        # Pharmacy ID
```

### Core Endpoints

**Products**

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/batch` - Add product batch

**Sales**

- `GET /api/sales` - List sales
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id/refund` - Refund a sale

**Customers**

- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer

**Suppliers**

- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/:id` - Get supplier details

**Users**

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details

**Categories**

- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

**Health**

- `GET /api/health` - Check API status

### Example Request

```bash
curl -X GET http://localhost:4000/api/products \
  -H "x-user-id: user-123" \
  -H "x-user-role: admin" \
  -H "x-pharmacy-id: ph-001"
```

## Database Schema

### Key Models

- **User** - System users with roles
- **Product** - Pharmacy products with batch tracking
- **ProductBatch** - Individual product batches with expiry dates
- **Category** - Product categories
- **Customer** - Customer information with loyalty points
- **Sale** - Sales transactions
- **SaleItem** - Individual items in a sale
- **Supplier** - Supplier information
- **PurchaseOrder** - Purchase orders from suppliers
- **StockAdjustment** - Inventory adjustments
- **CustomerDebt** - Customer credit/debt tracking
- **Branch** - Multiple pharmacy branches

### Database Relationships

- One Pharmacy has many Users, Products, Sales, Customers, Suppliers
- One Product has many Batches
- One Sale has many SaleItems
- One Customer has many Sales and Debts
- One Supplier has many PurchaseOrders

## Project Structure

```
backend/
├── src/
│   ├── controllers/         # Business logic
│   │   ├── dashboardController.ts
│   │   ├── productController.ts
│   │   └── salesController.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts         # Authentication & authorization
│   │   └── errorHandler.ts # Error handling
│   ├── routes/             # API routes
│   │   ├── products.ts
│   │   ├── sales.ts
│   │   ├── customers.ts
│   │   ├── suppliers.ts
│   │   ├── users.ts
│   │   └── categories.ts
│   ├── types/              # TypeScript types & interfaces
│   │   └── index.ts
│   ├── db.ts              # Prisma client setup
│   └── index.ts           # Server entry point
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Seed script
├── package.json
├── tsconfig.json
├── .env.example
└── docker-compose.yml
```

## Environment Variables

```
DATABASE_URL              # PostgreSQL connection string
PORT                     # Server port (default: 4000)
NODE_ENV                 # Environment (development/production)
JWT_SECRET              # JWT signing secret
LOG_LEVEL               # Logging level (debug/info/warn/error)
DEFAULT_PHARMACY_ID     # Default pharmacy ID
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (if available)"
}
```

HTTP Status Codes:

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., duplicate entry)
- `500` - Server Error

## Development

### Code Style

- TypeScript for type safety
- ESLint (configure in eslint.config.js)
- Format with Prettier

### Adding New Features

1. **Update Prisma Schema** (`prisma/schema.prisma`)
2. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```
3. **Create Controllers** in `src/controllers/`
4. **Create Routes** in `src/routes/`
5. **Add Types** in `src/types/index.ts`
6. **Update Main Routes** in `src/index.ts`

### Database Migrations

When schema changes:

```bash
npm run db:generate  # Update Prisma client
npm run db:push     # Push changes to database
```

## Production Deployment

1. **Build Project**

   ```bash
   npm run build
   ```

2. **Set Environment Variables**

   ```bash
   NODE_ENV=production
   DATABASE_URL=<your-production-db-url>
   ```

3. **Run Server**

   ```bash
   npm start
   ```

4. **With Docker**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

## Common Issues

### Database Connection Error

- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify credentials

### Port Already in Use

- Change PORT in .env
- Or kill process: `lsof -ti:4000 | xargs kill -9`

### TypeScript Errors

- Run `npm run db:generate`
- Clear node_modules: `rm -rf node_modules && npm install`

## Next Steps

- Set up JWT authentication
- Implement rate limiting
- Add email notifications
- Set up automated backups
- Configure logging system
- Deploy to cloud (AWS, GCP, Azure)

## Support

For issues or questions:

1. Check `task.md` for roadmap
2. Review Prisma docs: https://prisma.io/docs
3. Check Express docs: https://expressjs.com

## License

Private - PharmaSys

## Contributors

- Development Team

---

**Happy Coding! 🎉**
