# PharmaSys - Complete Project Overview

## 📊 Project Summary

PharmaSys is a comprehensive pharmacy management system with:

- **Backend**: Express.js with Prisma ORM (50+ RESTful APIs)
- **Frontend**: React with TypeScript and TailwindCSS
- **Database**: PostgreSQL with comprehensive schema
- **Offline-First**: Seamless offline/online sync with automatic cloud upload
- **PWA**: Works offline as a Progressive Web App

**Tech Stack:**

- Backend: Node.js, Express, Prisma, PostgreSQL, JWT
- Frontend: React 18, TypeScript, TailwindCSS, Vite, SQLite (client-side)
- Deployment: Docker, Vercel

---

## 📁 Project Structure

```
pharmasys/
├── backend/                          # Express.js Server
│   ├── src/
│   │   ├── index.ts                 # Main server file
│   │   ├── db.ts                    # Database connection
│   │   ├── controllers/             # Business logic
│   │   │   ├── dashboardController.ts
│   │   │   ├── productController.ts
│   │   │   ├── salesController.ts
│   │   │   └── ...
│   │   ├── middleware/              # Auth, error handling
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/                  # API endpoints
│   │   │   ├── products.ts
│   │   │   ├── sales.ts
│   │   │   ├── users.ts
│   │   │   ├── customers.ts
│   │   │   ├── categories.ts
│   │   │   ├── suppliers.ts
│   │   │   └── ...
│   │   ├── types/                   # TypeScript types
│   │   ├── constants/               # Constants
│   │   ├── utils/                   # Helper functions
│   │   └── validations/             # Zod schemas
│   ├── prisma/
│   │   ├── schema.prisma            # Data model
│   │   └── seed.ts                  # Database seeding
│   ├── docker-compose.yml           # Docker setup
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/                          # React Application
    ├── src/
    │   ├── index.css                # TailwindCSS
    │   ├── App.tsx                  # Root component
    │   ├── main.tsx                 # Entry point
    │   ├── pages/                   # Page components
    │   │   ├── Products.tsx
    │   │   ├── Sales.tsx / POS.tsx
    │   │   ├── Customers.tsx
    │   │   ├── Employees.tsx
    │   │   ├── Suppliers.tsx
    │   │   ├── Reports.tsx
    │   │   ├── Inventory.tsx
    │   │   └── ...
    │   ├── components/              # Reusable components
    │   │   ├── AppLayout.tsx
    │   │   ├── AppSidebar.tsx
    │   │   ├── HeaderNotifications.tsx
    │   │   ├── SyncStatus.tsx       # Sync indicator
    │   │   ├── ThemeProvider.tsx
    │   │   └── ui/                  # UI components
    │   ├── lib/
    │   │   ├── apiClient.ts         # **[NEW] Offline/Online Client**
    │   │   ├── utils.ts
    │   │   ├── SyncProvider.tsx     # **[NEW] Sync Initialization**
    │   │   └── INTEGRATION_GUIDE.ts # **[NEW] Integration Docs**
    │   ├── hooks/
    │   │   ├── useApi.ts            # **[NEW] Main API Hook**
    │   │   ├── useSyncStatus.ts     # **[NEW] Sync Monitoring**
    │   │   ├── useCustomersApi.ts   # **[NEW] API Pattern Example**
    │   │   ├── useOnlineStatus.ts   # Connection detection
    │   │   ├── usePOSCart.ts
    │   │   ├── useCustomers.ts      # [OLD - to migrate]
    │   │   └── ...
    │   ├── db/                      # Client-side SQLite
    │   │   ├── DatabaseProvider.tsx
    │   │   ├── sqlite.ts
    │   │   └── migrations.ts
    │   ├── i18n/                    # Internationalization
    │   │   ├── LanguageProvider.tsx
    │   │   └── translations.ts
    │   └── test/
    ├── public/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── vercel.json                  # Vercel deployment
    └── .env.example
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 12+ (or Docker)

### Installation

#### Windows:

```bash
setup.bat
```

#### macOS/Linux:

```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup:

1. **Backend:**

```bash
cd backend
npm install

# Create .env with database credentials
cp .env.example .env
# Edit .env file

# Setup database
npm run db:generate
npm run db:push
npm run db:seed      # Optional: add sample data

# Start server
npm run dev          # http://localhost:4000
```

2. **Frontend:**

```bash
cd frontend
npm install

# Create .env
cp .env.example .env

# Start dev server
npm run dev          # http://localhost:5173
```

---

## 🔄 Offline/Online Sync Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interaction                          │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────▼────────┐
         │ Online Check?  │
         └───┬────────┬───┘
             │        │
         YES │        │ NO
             │        └─────────────────────────────────┐
             │                                          │
        ┌────▼──────────┐                     ┌────────▼──────────┐
        │ Send to Server│                     │ Save to Queue     │
        │   Immediately │                     │ & localStorage    │
        └────┬──────────┘                     └────────┬──────────┘
             │                                        │
        ┌────▼──────────────────────────────────────────────┐
        │    Connection Restored Handler                    │
        │    (navigator.onLine event)                       │
        └────┬──────────────────────────────────────────────┘
             │
         ┌───▼────────────────────────────┐
         │ syncPendingRequests()           │
         │ - Load queue from localStorage  │
         │ - Batch requests (default: 10)  │
         │ - Retry with exponential backoff│
         │ - Max 3 attempts per request    │
         └────┬──────────────────────────┘
              │
         ┌────▼──────────────────────┐
         │ Update UI with Results    │
         │ - Fire sync events        │
         │ - Dispatch notifications  │
         │ - Refresh data if needed  │
         └────────────────────────────┘
```

### Key Features

1. **Queue-Based Storage**
   - All pending requests stored in localStorage
   - Format: `Array<{method, url, data, timestamp, retries}>`
   - Survives browser restarts

2. **Automatic Retry Logic**

   ```
   Attempt 1: Immediate
   Attempt 2: After 1 second
   Attempt 3: After 2 seconds
   Attempt 4: After 4 seconds

   Max: 3 attempts total
   ```

3. **Batch Processing**
   - Default: 10 requests per batch
   - Configurable via `SyncConfig`
   - Prevents server overload

4. **Event System**

   ```typescript
   syncStart; // When sync begins
   syncSuccess; // When request succeeds
   syncFailed; // When request fails after retries
   syncComplete; // When all pending are processed
   syncProgress; // Batch completion (index/total)
   ```

5. **Error Differentiation**
   ```
   "offline_saved"   // No internet, saved to queue
   "network"         // Connection error, retry later
   "validation"      // 4xx error, don't retry
   "server"          // 5xx error, retry later
   ```

---

## 📚 Integration Guide

### Step 1: Initialize Sync System

In `frontend/src/main.tsx`:

```typescript
import { SyncProvider } from './lib/SyncProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SyncProvider>
      <AppLayout />
    </SyncProvider>
  </React.StrictMode>,
)
```

### Step 2: Use API Hooks

**Fetching Data:**

```typescript
const { data, loading, error } = useApiData("/products");
```

**Creating/Updating:**

```typescript
const { mutate, loading } = useMutation("POST");
const handleSave = async (data) => {
  await mutate("/products", data);
};
```

**Custom Hook Pattern:**

```typescript
export function useProductsApi() {
  const { request } = useApi();

  return {
    list: () => request("GET", "/products"),
    create: (data) => request("POST", "/products", data),
    update: (id, data) => request("PUT", `/products/${id}`, data),
    delete: (id) => request("DELETE", `/products/${id}`),
  };
}
```

### Step 3: Monitor Sync Status

```typescript
const { isPending, pendingCount, hasFailedRequests } = useSyncStatus()

return (
  <div>
    <SyncStatusBadge />
    {isPending && <p>Syncing {pendingCount} requests...</p>}
    {hasFailedRequests && <p>Some requests failed. Retry?</p>}
  </div>
)
```

---

## 🧪 Testing Offline/Online Mode

### In Browser DevTools:

1. **Simulate Offline:**
   - Press F12 to open DevTools
   - Go to Network tab
   - Find "Throttling" dropdown
   - Select "Offline"

2. **Test Offline Operations:**
   - Add a product
   - Create a sale
   - Update customer info
   - Notice: "Syncing..." indicator appears
   - Data saves to localStorage

3. **Test Online Reconnection:**
   - Change Throttling back to "No throttling"
   - Or use DevTools Network offline toggle
   - Watch data sync automatically
   - Sync indicator shows progress

### In Code:

```typescript
// Manually trigger offline/online events
window.dispatchEvent(new Event("offline")); // Go offline
window.dispatchEvent(new Event("online")); // Go online
```

---

## 📝 API Endpoints

### Dashboard

```
GET    /api/dashboard/stats
GET    /api/dashboard/summary
GET    /api/dashboard/daily-sales
```

### Products

```
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/products/search
POST   /api/products/batch-import
```

### Sales & POS

```
GET    /api/sales
POST   /api/sales
GET    /api/sales/:id
PUT    /api/sales/:id
DELETE /api/sales/:id
POST   /api/sales/complete-sale
GET    /api/sales/daily-report
```

### Customers

```
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
GET    /api/customers/:id/debts
GET    /api/customers/:id/purchase-history
```

### Inventory

```
GET    /api/inventory
POST   /api/inventory/adjust-stock
GET    /api/inventory/low-stock
```

### Reports

```
GET    /api/reports/sales
GET    /api/reports/inventory
GET    /api/reports/customers
GET    /api/reports/profit
```

_(See `backend/README.md` for complete list)_

---

## 🔐 Authentication

### Headers Required:

```
x-user-id: <user_id>
x-user-role: <admin|manager|cashier|staff>
x-pharmacy-id: <pharmacy_id>
```

### Example:

```typescript
const headers = {
  "x-user-id": "123",
  "x-user-role": "cashier",
  "x-pharmacy-id": "1",
};

fetch("http://localhost:4000/api/products", { headers });
```

---

## 🌐 Environment Variables

### Backend (`.env`)

```
DATABASE_URL=postgresql://user:password@localhost:5432/pharmasys
JWT_SECRET=your-secret-key
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`.env`)

```
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=PharmaSys
VITE_ENABLE_LOGGING=true
```

---

## 📖 Documentation Files

| File                                                                  | Purpose                                 |
| --------------------------------------------------------------------- | --------------------------------------- |
| [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)                    | Complete integration guide (400+ lines) |
| [QUICK_START.md](QUICK_START.md)                                      | 5-minute quick start (250+ lines)       |
| [INTEGRATION_GUIDE.ts](frontend/src/lib/INTEGRATION_GUIDE.ts)         | Inline code examples                    |
| [ProductsPageExample.tsx](frontend/src/pages/ProductsPageExample.tsx) | Working example page                    |
| [backend/README.md](backend/README.md)                                | Backend API documentation               |

---

## 🐘 Database Schema Highlights

**Key Tables:**

- `User`: Users with roles (admin, manager, cashier, staff)
- `Customer`: Client information with contact details
- `Product`: Inventory items with barcode, pricing
- `Category`: Product categorization
- `Supplier`: Vendor information
- `Sale`: Transaction records with items
- `SaleItem`: Individual items in a sale
- `PurchaseOrder`: Orders from suppliers
- `Inventory`: Stock tracking and adjustments
- `Report`: Generated sales reports
- `Audit`: Change tracking for compliance

**Key Features:**

- Soft deletes (createdAt, updatedAt, deletedAt)
- Role-based access control
- Audit logging
- Cascading relationships
- Indexes on frequently queried fields

---

## ⚙️ Configuration

### API Client Config (Optional)

In `frontend/src/main.tsx`:

```typescript
initApiClient({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 30000, // Request timeout (ms)
  batchSize: 10, // Pending requests per batch
  retryAttempts: 3, // Max retry attempts
  retryDelay: 1000, // Initial retry delay (ms)
});
```

---

## 🚢 Deployment

### Backend (Docker)

```bash
# Build image
docker build -t pharmasys-backend .

# Run container
docker run -p 4000:4000 --env-file .env pharmasys-backend
```

### Frontend (Vercel)

```bash
# Deploy to Vercel
vercel

# Or deploy to production
npm run build
# Upload dist/ folder to hosting
```

---

## 📊 Performance Considerations

### Frontend

- Lazy loading for pages
- Code splitting via Vite
- Image optimization
- LocalStorage for caching (~5MB limit)

### Backend

- Database connection pooling
- Request validation with Zod
- Error logging
- CORS headers pre-configured

### Sync System

- Batching prevents request flooding
- Exponential backoff prevents thrashing
- localStorage limits: ~5-10MB per domain
- Compression recommended for large batches

---

## 🐛 Troubleshooting

### "Cannot connect to backend"

1. Check backend is running: `http://localhost:4000/api/health`
2. Check CORS headers in backend/src/index.ts
3. Verify VITE_API_URL environment variable
4. Check browser console for detailed error

### "Offline but data not saving"

1. Verify browser has localStorage enabled
2. Check DevTools > Application > Storage > localStorage
3. Expected key: `pharmasys_sync_queue`
4. Try clearing cache and restarting

### "Sync not working on reconnect"

1. Open DevTools > Events listeners
2. Look for "online" event firing
3. Manually trigger: `window.dispatchEvent(new Event('online'))`
4. Check console for sync errors

### "Pending requests stuck"

1. Clear sync queue: `localStorage.clear('pharmasys_sync_queue')`
2. Restart browser
3. Check backend logs for errors
4. Verify backend database connection

---

## 📞 Support

### Getting Help

1. Check [QUICK_START.md](QUICK_START.md) for common issues
2. Review [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for advanced topics
3. Check backend logs: `npm run dev 2>&1 | grep error`
4. Enable logging: `VITE_ENABLE_LOGGING=true`

### Community

- Report issues with error logs and browser console output
- Include reproduction steps
- Attach screenshot of sync status

---

## 📋 Checklist for First Run

- [ ] Backend running on http://localhost:4000
- [ ] Frontend running on http://localhost:5173
- [ ] Can load homepage without errors
- [ ] Sync status indicator visible
- [ ] Can add a product online
- [ ] Data persists in database
- [ ] Can go offline and add a product
- [ ] Data appears in sync queue
- [ ] Can go back online
- [ ] Offline data syncs automatically
- [ ] Toast notifications showing sync progress

---

## 📄 License

MIT License - See LICENSE file

---

## 🎉 Next Steps

1. **Data Verification**
   - Set up seeded test data
   - Verify all CRUD operations work

2. **UI Customization**
   - Adjust colors/branding
   - Add company logo

3. **User Management**
   - Create admin account
   - Set up staff accounts

4. **Offline Testing**
   - Test with real users
   - Collect feedback

5. **Performance Tuning**
   - Monitor database queries
   - Optimize slow endpoints

6. **Deployment Preparation**
   - Set up production database
   - Configure production environment
   - Set up monitoring/logging

---

**Built with ❤️ for efficient pharmacy management**

Last Updated: 2024
Version: 1.0.0
