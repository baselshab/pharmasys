# 🎯 PharmaSys Implementation Guide - What's Done & Next Steps

## ✅ What Has Been Completed

### Phase 1: Backend Infrastructure ✓

- **50+ RESTful API endpoints** across 7 main resources
- **Prisma ORM** with 19 database models
- **Authentication middleware** with role-based access
- **Error handling** with custom error classes
- **Data validation** using Zod schemas
- **Database migrations** and seeding scripts
- **Docker support** with docker-compose.yml

### Phase 2: Frontend + Backend Integration ✓

- **Offline-first architecture** with localStorage sync queue
- **Smart API client** with automatic retry logic
- **React hooks** for data fetching and mutations
- **UI components** for sync status display
- **Event system** for reactive updates
- **Error handling** with offline/online differentiation
- **Batch processing** for efficient syncing

### Files Created - Critical New Features

| File                                         | Purpose           | Lines |
| -------------------------------------------- | ----------------- | ----- |
| `frontend/src/lib/apiClient.ts`              | Core sync engine  | 250+  |
| `frontend/src/hooks/useApi.ts`               | React API hooks   | 150+  |
| `frontend/src/hooks/useSyncStatus.ts`        | Sync monitoring   | 100+  |
| `frontend/src/components/SyncStatus.tsx`     | UI indicators     | 200+  |
| `frontend/src/hooks/useCustomersApi.ts`      | Pattern example   | 100+  |
| `frontend/src/lib/SyncProvider.tsx`          | Initialization    | 30+   |
| `frontend/src/lib/INTEGRATION_GUIDE.ts`      | Code examples     | 400+  |
| `frontend/src/pages/ProductsPageExample.tsx` | Working example   | 350+  |
| `FRONTEND_INTEGRATION.md`                    | Integration docs  | 400+  |
| `QUICK_START.md`                             | Quick start guide | 250+  |
| `PROJECT_OVERVIEW.md`                        | This file         | -     |

---

## 🏗️ Architecture Overview

### System Flow

```
┌─────────────────────┐
│   User Interaction  │
│   (React Component) │
└──────────┬──────────┘
           │
           ├─ Online? ──YES──→ Fetch from Server
           │                       │
           │          NO           │
           └──────────────────────┼──→ Fetch from SQLite/localStorage
                                  │
                                  ▼
                          ┌───────────────┐
                          │  Response OK? │
                          └──┬──────────┬─┘
                            YES        │
                             │         NO
                             │         │
                        ┌────▼──┐  ┌──▼────────────────┐
                        │ Cache │  │  Queue for Later  │
                        │       │  │ (when back online)│
                        └────┬──┘  └──────────────────┘
                             │
                        ┌────▼─────────────────┐
                        │  Dispatch Event      │
                        │  (notify UI)         │
                        └────────────────────┘
                             │
                        ┌────▼──────────────┐
                        │  Update Component  │
                        │  (show data)       │
                        └───────────────────┘
```

### Key Components

**apiClient.ts** - The Brain

```typescript
✓ Detects online/offline status
✓ Queues requests when offline
✓ Syncs automatically on reconnect
✓ Retries failed requests (exponential backoff)
✓ Batch processes to avoid server overload
✓ Fires events for UI updates
✓ Persists queue to localStorage
```

**useApi.ts** - React Integration

```typescript
✓ useApi() - basic request maker
✓ useApiData() - fetch with caching
✓ useMutation() - POST/PUT/DELETE
✓ Convenience hooks (create, update, delete)
```

**SyncStatus.tsx** - User Feedback

```typescript
✓ SyncStatusIndicator - detailed view
✓ SyncStatusDot - animated dot
✓ SyncStatusBadge - navbar badge
✓ Shows: online/offline, pending count, sync progress
```

---

## 🚀 Getting Started

### 1. Clone & Setup

Windows:

```bash
setup.bat
```

macOS/Linux:

```bash
chmod +x setup.sh
./setup.sh
```

### 2. Start Services (3 Terminal Windows)

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Starts on http://localhost:4000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# Starts on http://localhost:5173
```

**Terminal 3 - Database (if needed):**

```bash
cd backend
npm run db:watch
# Watches for schema changes
```

### 3. Verify Connection

```bash
# Backend health check
curl http://localhost:4000/api/health

# Frontend loads
open http://localhost:5173
```

---

## 📖 Step-by-Step Integration

### Step 1: Configure Environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=PharmaSys
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/pharmasys
JWT_SECRET=your-secret-key
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Step 2: Initialize Sync Provider

Edit `frontend/src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { SyncProvider } from './lib/SyncProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SyncProvider>
      <App />
    </SyncProvider>
  </React.StrictMode>,
)
```

### Step 3: Create First API Hook

Create `frontend/src/hooks/useProductsApi.ts`:

```typescript
import { useApi } from "./useApi";

export function useProductsApi() {
  const { request } = useApi();

  return {
    // Fetch all products
    list: async () => {
      const { data } = await request("GET", "/products");
      return data;
    },

    // Create product
    create: async (formData) => {
      const { data } = await request("POST", "/products", formData);
      return data;
    },

    // Update product
    update: async (id, formData) => {
      const { data } = await request("PUT", `/products/${id}`, formData);
      return data;
    },

    // Delete product
    delete: async (id) => {
      await request("DELETE", `/products/${id}`);
    },

    // Search products
    search: async (query) => {
      const { data } = await request("GET", `/products?search=${query}`);
      return data;
    },
  };
}
```

### Step 4: Use Hook in Component

```typescript
import { useProductsApi } from '@/hooks/useProductsApi'
import { useApiData, useMutation } from '@/hooks/useApi'

export function ProductsPage() {
  // Fetch products
  const { data: products, loading, error } = useApiData('/products')

  // Create/Update product
  const { mutate: saveProduct, loading: saving } = useMutation('POST')

  // Delete product
  const { mutate: deleteProduct } = useMutation('DELETE')

  const handleSave = async (formData) => {
    try {
      await saveProduct('/products', formData)
      // Refresh list
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Products</h1>

      {/* Show sync status */}
      <SyncStatusBadge />

      {/* Product form */}
      <form onSubmit={(e) => {
        e.preventDefault()
        handleSave(new FormData(e.currentTarget))
      }}>
        <input name="name" placeholder="Product name" />
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>

      {/* Product list */}
      <div className="grid">
        {products?.map(product => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button onClick={() => deleteProduct(`/products/${product.id}`)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🧪 Test Offline Mode

### Browser DevTools Method

1. **Open DevTools**: Press `F12`
2. **Go to Network tab**
3. **Find "Throttling"** dropdown
4. **Select "Offline"** ⏸️
5. **Try adding data** (should save locally)
6. **Set back to "No throttling"** ✅
7. **Watch automatic sync** 🔄

### Expected Behavior

**When Offline:**

- ✅ Add/Edit/Delete works locally
- ✅ Data saves to localStorage + SQLite
- ✅ Sync indicator shows "Offline (5 pending)"
- ✅ No server requests made

**When Reconnecting:**

- ✅ Sync indicator changes color
- ✅ "Syncing 5 requests..." appears
- ✅ Requests sent to server in batches
- ✅ After success: "Sync complete!"
- ✅ Data visible on server

---

## 🔐 Authentication Setup

### Headers Required for All Requests

Every API request must include:

```typescript
headers: {
  'x-user-id': 'user-123',          // User ID
  'x-user-role': 'cashier',         // Role: admin|manager|cashier|staff
  'x-pharmacy-id': '1'              // Pharmacy/Branch ID
}
```

### How It's Handled

**apiClient.ts** automatically adds these from localStorage:

```typescript
// In apiClient.ts - makeRequest() method
const userId = localStorage.getItem("user_id");
const userRole = localStorage.getItem("user_role");
const pharmacyId = localStorage.getItem("pharmacy_id");

headers = {
  ...headers,
  "x-user-id": userId,
  "x-user-role": userRole,
  "x-pharmacy-id": pharmacyId,
};
```

### Set Headers on Login

```typescript
// In login handler
const response = await fetch("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});

const { user, token } = await response.json();

// Store for all future requests
localStorage.setItem("user_id", user.id);
localStorage.setItem("user_role", user.role);
localStorage.setItem("pharmacy_id", user.pharmacyId);
```

---

## 📊 What's in Each Hook

### useApi() - Low Level

```typescript
// Basic request wrapper
const { request } = useApi();

// Make any request
const { data, error, loading } = await request("POST", "/products", {
  name: "Aspirin",
  price: 5,
});
```

### useApiData() - Fetch with Caching

```typescript
// Fetch data automatically
const { data, loading, error, refetch } = useApiData("/products");

// data = array of products
// loading = true while fetching
// error = error message or null
// refetch = function to refresh
```

### useMutation() - Create/Update/Delete

```typescript
// For mutations
const { mutate, loading } = useMutation("PUT");

// Use in handler
await mutate(`/products/${id}`, { name: "New Name" });
```

### useCustomersApi() - Full Pattern

```typescript
// Example showing how to build API hooks
const api = useCustomersApi();

// CRUD operations
await api.list();
await api.create({ name: "John" });
await api.update(id, { name: "Jane" });
await api.delete(id);

// Special operations
await api.getDebts(customerId);
await api.getPurchaseHistory(customerId);
```

---

## 🎨 UI Components

### SyncStatusIndicator - Detailed View

```typescript
<SyncStatusIndicator />

// Shows:
// - Connection status (online/offline)
// - Pending requests count
// - Sync progress
// - Error list with retry button
// - Clear queue button
```

### SyncStatusDot - Compact View

```typescript
<SyncStatusDot />

// Shows:
// ✅ Green dot = online, synced
// 🔄 Spinning orange = syncing
// 🔴 Red dot = offline or error
```

### SyncStatusBadge - Navbar View

```typescript
<SyncStatusBadge />

// Shows:
// "🌐 Online"
// "📡 Syncing..."
// "⚠️ Offline (5 pending)"
```

---

## ⚙️ Configuration Options

### Customize Sync Behavior

In `frontend/src/main.tsx`:

```typescript
import { initApiClient } from "./lib/apiClient";

initApiClient({
  // API endpoint
  baseUrl: "http://localhost:4000/api",

  // Request timeout (ms)
  timeout: 30000,

  // How many requests per batch when syncing
  batchSize: 10,

  // How many times to retry failed requests
  retryAttempts: 3,

  // Initial delay between retries (ms)
  // Doubles each retry: 1000, 2000, 4000
  retryDelay: 1000,
});
```

---

## 🐛 Debugging & Troubleshooting

### Check Sync Queue

```javascript
// In browser console
localStorage.getItem("pharmasys_sync_queue");
// Shows JSON array of pending requests
```

### View All Events

```javascript
// In browser console
window.addEventListener("syncStart", () => console.log("Sync started"));
window.addEventListener("syncSuccess", (e) =>
  console.log("Success:", e.detail),
);
window.addEventListener("syncFailed", (e) => console.log("Failed:", e.detail));
window.addEventListener("syncComplete", () => console.log("All synced!"));
```

### Manual Offline Testing

```javascript
// Go offline
window.dispatchEvent(new Event("offline"));

// Go online
window.dispatchEvent(new Event("online"));
```

### Check API Client Status

```javascript
// In console
import { getApiClient } from "./lib/apiClient";
const client = getApiClient();
console.log(client); // Shows all details
```

---

## 📋 Files to Migrate

### Existing Hooks to Replace

| Old Hook        | Replace With         | Status       |
| --------------- | -------------------- | ------------ |
| `useCustomers`  | `useCustomersApi()`  | ✅ Created   |
| `useProducts`   | `useProductsApi()`   | ⏳ To Create |
| `useSales`      | `useSalesApi()`      | ⏳ To Create |
| `useSuppliers`  | `useSuppliersApi()`  | ⏳ To Create |
| `useUsers`      | `useUsersApi()`      | ⏳ To Create |
| `useCategories` | `useCategoriesApi()` | ⏳ To Create |

### Existing Pages to Update

| Page                | Priority | Status    |
| ------------------- | -------- | --------- |
| Customers.tsx       | HIGH     | ⏳ Update |
| Products.tsx        | HIGH     | ⏳ Update |
| Sales.tsx / POS.tsx | HIGH     | ⏳ Update |
| Suppliers.tsx       | MEDIUM   | ⏳ Update |
| Employees.tsx       | MEDIUM   | ⏳ Update |
| Reports.tsx         | MEDIUM   | ⏳ Update |
| Inventory.tsx       | LOW      | ⏳ Update |

---

## 🎓 Example Workflows

### Workflow 1: Add Product (Online)

```
1. User enters product data
2. Clicks "Save"
3. handleSave() calls mutate()
4. apiClient sends POST to server
5. Server responds with new product
6. UI refreshes with new product
7. Toast: "Product saved!"
```

### Workflow 2: Add Product (Offline)

```
1. User enters product data
2. Clicks "Save"
3. handleSave() calls mutate()
4. apiClient detects offline
5. Saves to localStorage queue
6. UI shows "Offline (1 pending)"
7. Toast: "Saved locally, syncing when online"
```

### Workflow 3: Reconnect & Sync

```
1. Browser detects internet
2. Fires 'online' event
3. apiClient.syncPendingRequests()
4. Loads queue from localStorage
5. Batches requests (10 at a time)
6. Sends to server
7. Server processes and responds
8. useComponent receives update event
9. UI refreshes with synced data
10. Clears localStorage queue
```

---

## 📈 Performance Tips

### For Large Datasets

```typescript
// Paginate instead of loading all
const { data } = useApiData("/products?page=1&limit=50");
```

### For Real-time Data

```typescript
// Use refetch to refresh periodically
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 5000); // Refresh every 5 seconds

  return () => clearInterval(interval);
}, [refetch]);
```

### For Search/Filter

```typescript
// Debounce search requests
const debouncedSearch = useCallback(
  debounce((query) => {
    request("GET", `/products?search=${query}`);
  }, 500),
  [],
);
```

---

## 🚀 Next Steps (Recommended Order)

### Phase 3: Migration & Testing

- [ ] Create API hooks for all resources
- [ ] Update ProductsPage.tsx to use new hooks
- [ ] Update CustomerPage.tsx to use new hooks
- [ ] Test offline/online workflows
- [ ] Add real toast notifications

### Phase 4: Optimization

- [ ] Add request caching
- [ ] Implement pagination
- [ ] Add real-time sync intervals
- [ ] Performance monitoring

### Phase 5: Deployment

- [ ] Setup production database
- [ ] Configure environment variables
- [ ] Deploy backend to production
- [ ] Deploy frontend to Vercel
- [ ] Monitor in production

---

## 📚 Documentation References

| Resource                   | Location                                                                                 | Content                       |
| -------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------- |
| **Full Integration Guide** | [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)                                       | 400+ lines, advanced topics   |
| **Quick Start**            | [QUICK_START.md](QUICK_START.md)                                                         | 250+ lines, beginner-friendly |
| **Code Examples**          | [frontend/src/lib/INTEGRATION_GUIDE.ts](frontend/src/lib/INTEGRATION_GUIDE.ts)           | 12 sections with inline code  |
| **Working Example**        | [frontend/src/pages/ProductsPageExample.tsx](frontend/src/pages/ProductsPageExample.tsx) | Complete page implementation  |
| **API Patterns**           | [frontend/src/hooks/useCustomersApi.ts](frontend/src/hooks/useCustomersApi.ts)           | Template for resource hooks   |
| **Backend API**            | [backend/README.md](backend/README.md)                                                   | All 50+ endpoints documented  |
| **Architecture**           | [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)                                               | System design & deployment    |

---

## 💡 Key Concepts Recap

### Queue-Based Sync ✅

- All offline requests queued to localStorage
- Survives browser restart
- Synced automatically on reconnect

### Event-Driven UI ✅

- Components listen to sync events
- Responsive status updates
- No polling needed

### Retry Logic ✅

- Exponential backoff (1s, 2s, 4s)
- Max 3 attempts
- Failed requests show in UI

### Error Differentiation ✅

- "offline_saved" = no internet, queued
- "network" = connection error, retry later
- "validation" = bad data, don't retry
- "server" = 5xx error, retry later

### Offline-First ✅

- Works without internet
- Seamless UX
- Automatic sync
- No data loss

---

## 🎉 You're Ready!

Everything is set up. You can now:

1. ✅ Start backend & frontend
2. ✅ Test online operations
3. ✅ Go offline and test local operations
4. ✅ Reconnect and watch data sync
5. ✅ Build new pages using the hooks

**Start with:**

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Open http://localhost:5173
```

**Test sync with:**

- DevTools > Network > Throttling: Offline
- Add/edit/delete data
- Switch back to Online
- Watch sync 🎉

---

**Happy Building! 🚀**

Questions? Check FRONTEND_INTEGRATION.md or QUICK_START.md

Last Updated: 2024
