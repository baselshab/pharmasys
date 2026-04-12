# Pharmacy Management System (PMS)

## Overview

A Progressive Web App (PWA) for pharmacy operations with **full offline support**, local SQLite storage, and background sync. Built with React + Vite + TypeScript.

Each pharmacy operates independently offline, syncing with the central server when connectivity is available.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technical Stack](#technical-stack)
3. [Feature Specifications](#feature-specifications)
4. [Database Schema](#database-schema)
5. [Offline & Sync Strategy](#offline--sync-strategy)
6. [PWA Configuration](#pwa-configuration)
7. [API Layer](#api-layer)
8. [Module Breakdown](#module-breakdown)
9. [Security](#security)
10. [Future: Multi-Pharmacy Support](#future-multi-pharmacy-support)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  CLIENT (PWA)                    │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  React   │  │  SQLite  │  │ Service Worker │  │
│  │   UI     │◄─►│  (WASM)  │  │  (SW)          │  │
│  └──────────┘  └────┬─────┘  └───────┬───────┘  │
│                     │                │           │
│              ┌──────┴────────────────┴──────┐    │
│              │     Sync Engine              │    │
│              │  - Change tracker            │    │
│              │  - Conflict resolver         │    │
│              │  - Queue manager             │    │
│              └──────────────┬───────────────┘    │
└─────────────────────────────┼────────────────────┘
                              │ HTTPS (when online)
                              ▼
┌─────────────────────────────────────────────────┐
│                 SERVER (Supabase)                │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Auth     │  │ Postgres │  │  Edge          │  │
│  │          │  │ Database │  │  Functions     │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────┘
```

### Data Flow

1. **User action** → React UI → Local SQLite (immediate)
2. **Background sync** → Sync Engine detects online → pushes changes to server
3. **Remote pull** → Sync Engine polls/subscribes → pulls server changes → merges into local SQLite

---

## 2. Technical Stack

| Layer              | Technology                          |
|--------------------|-------------------------------------|
| Frontend Framework | React 18 + Vite + TypeScript        |
| UI Components      | shadcn/ui + Tailwind CSS            |
| Local Database     | sql.js (SQLite compiled to WASM)    |
| State Management   | TanStack Query + React Context      |
| PWA                | vite-plugin-pwa (Workbox)           |
| Routing            | React Router v6                     |
| Charts/Reports     | Recharts                            |
| Backend            | Supabase (Lovable Cloud)            |
| Auth               | Supabase Auth                       |
| Sync               | Custom sync engine + Service Worker |

---

## 3. Feature Specifications

### 3.1 Point of Sale (POS)

| Feature              | Description                                                |
|----------------------|------------------------------------------------------------|
| Product search       | Search by name, barcode, or category with instant results  |
| Cart management      | Add/remove items, adjust quantities, apply discounts       |
| Payment processing   | Cash, card, mobile money, split payments                   |
| Receipt generation   | Digital receipts (PDF/print), receipt history               |
| Quick sale           | Favorites/frequent items for fast checkout                 |
| Return/refund        | Process returns against original sale                      |
| Hold/resume sale     | Park a transaction and resume later                        |
| Offline POS          | Full functionality without internet                        |

### 3.2 Inventory / Stock Management

| Feature              | Description                                                |
|----------------------|------------------------------------------------------------|
| Product catalog      | Name, generic name, barcode, category, unit, price         |
| Stock levels         | Current quantity, reorder level, max stock                  |
| Batch tracking       | Batch number, manufacturing date, expiry date              |
| Stock adjustments    | Manual adjustments with reason codes                       |
| Stock transfers      | Transfer between locations (future multi-pharmacy)         |
| Low stock alerts     | Notifications when stock falls below reorder level         |
| Expiry alerts        | Notifications for products nearing expiry (30/60/90 days)  |
| Stock valuation      | FIFO, weighted average cost methods                        |

### 3.3 Purchase Management

| Feature              | Description                                                |
|----------------------|------------------------------------------------------------|
| Purchase orders      | Create, approve, receive POs                               |
| Supplier management  | Supplier profiles, contact info, payment terms             |
| Goods receiving      | Receive against PO, partial receipts                       |
| Purchase returns     | Return damaged/expired goods to supplier                   |
| Price history        | Track purchase price changes over time                     |

### 3.4 Customer & Supplier Records

| Feature              | Description                                                |
|----------------------|------------------------------------------------------------|
| Customer profiles    | Name, phone, email, address, loyalty points                |
| Purchase history     | Per-customer sales history                                 |
| Credit management    | Customer credit limits and balances                        |
| Supplier directory   | Supplier catalog with product associations                 |

### 3.5 Reports & Analytics

| Feature              | Description                                                |
|----------------------|------------------------------------------------------------|
| Sales reports        | Daily, weekly, monthly, by product/category/staff          |
| Profit analysis      | Gross margin per product, category, time period            |
| Inventory reports    | Stock valuation, movement, aging, expiry                   |
| Purchase reports     | Spend by supplier, product, time period                    |
| Dashboard            | KPI cards, trend charts, alerts summary                    |
| Export               | CSV, PDF export for all reports                            |

---

## 4. Database Schema

### 4.1 Local SQLite Schema

```sql
-- ============================================
-- CORE TABLES
-- ============================================

-- Pharmacy identity (for multi-pharmacy future)
CREATE TABLE pharmacy (
  id            TEXT PRIMARY KEY,  -- UUID
  name          TEXT NOT NULL,
  address       TEXT,
  phone         TEXT,
  license_no    TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Users / Staff
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  pharmacy_id   TEXT NOT NULL REFERENCES pharmacy(id),
  full_name     TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User roles (separate table per security best practices)
CREATE TABLE user_roles (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'pharmacist', 'cashier', 'manager')),
  UNIQUE(user_id, role)
);

-- ============================================
-- INVENTORY
-- ============================================

CREATE TABLE categories (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  parent_id     TEXT REFERENCES categories(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE products (
  id            TEXT PRIMARY KEY,
  pharmacy_id   TEXT NOT NULL REFERENCES pharmacy(id),
  category_id   TEXT REFERENCES categories(id),
  name          TEXT NOT NULL,
  generic_name  TEXT,
  barcode       TEXT,
  unit          TEXT NOT NULL DEFAULT 'piece', -- piece, box, strip, bottle
  sell_price    REAL NOT NULL,
  cost_price    REAL NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  max_stock     INTEGER DEFAULT 1000,
  is_active     INTEGER NOT NULL DEFAULT 1,
  requires_prescription INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE product_batches (
  id              TEXT PRIMARY KEY,
  product_id      TEXT NOT NULL REFERENCES products(id),
  batch_number    TEXT NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 0,
  cost_price      REAL NOT NULL,
  manufacture_date TEXT,
  expiry_date     TEXT NOT NULL,
  received_date   TEXT NOT NULL DEFAULT (datetime('now')),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE stock_adjustments (
  id            TEXT PRIMARY KEY,
  product_id    TEXT NOT NULL REFERENCES products(id),
  batch_id      TEXT REFERENCES product_batches(id),
  user_id       TEXT NOT NULL REFERENCES users(id),
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('increase', 'decrease', 'damage', 'expired', 'correction')),
  quantity      INTEGER NOT NULL,
  reason        TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- SUPPLIERS & PURCHASES
-- ============================================

CREATE TABLE suppliers (
  id            TEXT PRIMARY KEY,
  pharmacy_id   TEXT NOT NULL REFERENCES pharmacy(id),
  name          TEXT NOT NULL,
  contact_person TEXT,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  payment_terms TEXT, -- e.g., "Net 30"
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE purchase_orders (
  id            TEXT PRIMARY KEY,
  pharmacy_id   TEXT NOT NULL REFERENCES pharmacy(id),
  supplier_id   TEXT NOT NULL REFERENCES suppliers(id),
  user_id       TEXT NOT NULL REFERENCES users(id),
  order_number  TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'partial', 'received', 'cancelled')),
  total_amount  REAL NOT NULL DEFAULT 0,
  notes         TEXT,
  order_date    TEXT NOT NULL DEFAULT (datetime('now')),
  expected_date TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE purchase_order_items (
  id              TEXT PRIMARY KEY,
  purchase_order_id TEXT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id      TEXT NOT NULL REFERENCES products(id),
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER NOT NULL DEFAULT 0,
  unit_cost       REAL NOT NULL,
  total_cost      REAL NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- CUSTOMERS & SALES
-- ============================================

CREATE TABLE customers (
  id            TEXT PRIMARY KEY,
  pharmacy_id   TEXT NOT NULL REFERENCES pharmacy(id),
  name          TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  credit_limit  REAL NOT NULL DEFAULT 0,
  credit_balance REAL NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sales (
  id              TEXT PRIMARY KEY,
  pharmacy_id     TEXT NOT NULL REFERENCES pharmacy(id),
  customer_id     TEXT REFERENCES customers(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  sale_number     TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'partial_refund', 'on_hold')),
  subtotal        REAL NOT NULL,
  discount_amount REAL NOT NULL DEFAULT 0,
  tax_amount      REAL NOT NULL DEFAULT 0,
  total_amount    REAL NOT NULL,
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile', 'credit', 'split')),
  amount_paid     REAL NOT NULL,
  change_amount   REAL NOT NULL DEFAULT 0,
  notes           TEXT,
  sale_date       TEXT NOT NULL DEFAULT (datetime('now')),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sale_items (
  id            TEXT PRIMARY KEY,
  sale_id       TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id    TEXT NOT NULL REFERENCES products(id),
  batch_id      TEXT REFERENCES product_batches(id),
  quantity      INTEGER NOT NULL,
  unit_price    REAL NOT NULL,
  discount      REAL NOT NULL DEFAULT 0,
  total_price   REAL NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sale_payments (
  id            TEXT PRIMARY KEY,
  sale_id       TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  amount        REAL NOT NULL,
  reference     TEXT, -- card ref, mobile money ref, etc.
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- SYNC TRACKING
-- ============================================

CREATE TABLE sync_log (
  id            TEXT PRIMARY KEY,
  table_name    TEXT NOT NULL,
  record_id     TEXT NOT NULL,
  operation     TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  payload       TEXT NOT NULL, -- JSON of the changed record
  synced        INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  synced_at     TEXT
);

CREATE TABLE sync_meta (
  key           TEXT PRIMARY KEY,
  value         TEXT NOT NULL,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_pharmacy ON products(pharmacy_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_pharmacy ON sales(pharmacy_id);
CREATE INDEX idx_sync_log_unsynced ON sync_log(synced) WHERE synced = 0;
CREATE INDEX idx_batches_expiry ON product_batches(expiry_date);
CREATE INDEX idx_batches_product ON product_batches(product_id);
```

### 4.2 Server Schema (Supabase/Postgres)

Mirrors the local schema with additional fields:

- `server_updated_at` — timestamp for conflict resolution
- `pharmacy_id` — tenant isolation for multi-pharmacy
- RLS policies per pharmacy

---

## 5. Offline & Sync Strategy

### 5.1 Architecture

```
┌─────────────────────────────────────┐
│           SYNC ENGINE               │
│                                     │
│  ┌───────────┐  ┌────────────────┐  │
│  │ Change    │  │ Conflict       │  │
│  │ Tracker   │  │ Resolver       │  │
│  │ (triggers)│  │ (LWW / merge)  │  │
│  └─────┬─────┘  └───────┬────────┘  │
│        │                │           │
│  ┌─────▼────────────────▼────────┐  │
│  │       Queue Manager           │  │
│  │  - Batched uploads            │  │
│  │  - Retry with backoff         │  │
│  │  - Ordered by timestamp       │  │
│  └───────────────┬───────────────┘  │
│                  │                  │
└──────────────────┼──────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Network Layer     │
        │  - Online detection │
        │  - API calls        │
        └─────────────────────┘
```

### 5.2 Change Tracking

Every write to local SQLite also inserts a row into `sync_log`:

```typescript
interface SyncLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: string; // JSON
  synced: boolean;
  created_at: string;
}
```

### 5.3 Push Strategy (Local → Server)

1. Service Worker or app foreground detects online status
2. Query `sync_log WHERE synced = 0 ORDER BY created_at`
3. Batch entries (max 50 per request)
4. POST to `/api/sync/push` with batch payload
5. Server processes each entry, returns success/conflict per record
6. Mark successful entries as `synced = 1`
7. For conflicts, apply resolution strategy (see 5.5)

### 5.4 Pull Strategy (Server → Local)

1. Store `last_pull_timestamp` in `sync_meta`
2. On sync trigger: GET `/api/sync/pull?since={last_pull_timestamp}`
3. Server returns all records modified since that timestamp
4. Apply changes to local SQLite (upsert)
5. Update `last_pull_timestamp`

### 5.5 Conflict Resolution

**Strategy: Last-Write-Wins (LWW) with field-level merge**

| Scenario                        | Resolution                              |
|--------------------------------|------------------------------------------|
| Same record, different fields  | Merge both field changes                 |
| Same record, same field        | Server timestamp wins (LWW)             |
| Local delete, server update    | Keep server version (undelete)           |
| Server delete, local update    | Mark as deleted locally                  |
| Unresolvable conflict          | Flag for manual review by user           |

### 5.6 Sync Triggers

| Trigger                    | Action                    |
|---------------------------|---------------------------|
| App comes online          | Push then Pull            |
| Every 5 minutes (online)  | Push then Pull            |
| User initiates manual sync| Push then Pull            |
| Background sync event     | Push then Pull (SW)       |
| Before critical operation | Pull (ensure fresh data)  |

---

## 6. PWA Configuration

### 6.1 Service Worker Strategy

```typescript
// vite-plugin-pwa configuration
{
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
    navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 86400 }
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: { maxEntries: 200, maxAgeSeconds: 2592000 }
        }
      }
    ]
  },
  manifest: {
    name: 'Pharmacy Management System',
    short_name: 'PharmaSYS',
    description: 'Offline-first pharmacy management with SYS, inventory, and sync',
    theme_color: '#0F766E',
    background_color: '#F0FDF4',
    display: 'standalone',
    orientation: 'any',
    categories: ['business', 'medical', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }
}
```

### 6.2 Offline Caching Layers

| Layer          | What's Cached                        | Strategy      |
|---------------|--------------------------------------|---------------|
| App Shell     | HTML, CSS, JS, WASM                  | Precache      |
| Static Assets | Images, fonts, icons                 | CacheFirst    |
| API Responses | Sync endpoints                       | NetworkFirst  |
| Data          | All business data in local SQLite    | SQLite (OPFS) |

### 6.3 Background Sync

```typescript
// Register background sync in service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'pharmacy-sync') {
    event.waitUntil(performSync());
  }
});

// Request sync when data changes
navigator.serviceWorker.ready.then((registration) => {
  registration.sync.register('pharmacy-sync');
});
```

---

## 7. API Layer

### 7.1 Endpoints

| Method | Endpoint                    | Description                          |
|--------|-----------------------------|--------------------------------------|
| POST   | `/api/sync/push`            | Push local changes to server         |
| GET    | `/api/sync/pull`            | Pull server changes since timestamp  |
| POST   | `/api/auth/login`           | Authenticate user                    |
| POST   | `/api/auth/refresh`         | Refresh auth token                   |
| GET    | `/api/pharmacy/:id/status`  | Get pharmacy sync status             |

### 7.2 Push Payload

```typescript
interface SyncPushRequest {
  pharmacy_id: string;
  device_id: string;
  batch: {
    table: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    record_id: string;
    data: Record<string, any>;
    local_timestamp: string;
  }[];
}

interface SyncPushResponse {
  results: {
    record_id: string;
    status: 'ok' | 'conflict' | 'error';
    server_data?: Record<string, any>; // returned on conflict
    error?: string;
  }[];
  server_timestamp: string;
}
```

### 7.3 Pull Payload

```typescript
interface SyncPullResponse {
  changes: {
    table: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    record_id: string;
    data: Record<string, any>;
    server_timestamp: string;
  }[];
  has_more: boolean;
  cursor: string; // for pagination
}
```

---

## 8. Module Breakdown

### 8.1 Directory Structure

```
src/
├── assets/                    # Static assets (images, icons)
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── layout/                # Shell, Sidebar, Header, Footer
│   ├── pos/                   # POS-specific components
│   │   ├── ProductSearch.tsx
│   │   ├── Cart.tsx
│   │   ├── PaymentDialog.tsx
│   │   └── Receipt.tsx
│   ├── inventory/             # Inventory components
│   │   ├── ProductForm.tsx
│   │   ├── StockTable.tsx
│   │   ├── BatchManager.tsx
│   │   └── ExpiryAlerts.tsx
│   ├── purchases/             # Purchase components
│   │   ├── PurchaseOrderForm.tsx
│   │   ├── GoodsReceiving.tsx
│   │   └── SupplierSelect.tsx
│   ├── customers/             # Customer components
│   ├── reports/               # Report & chart components
│   └── sync/                  # Sync status indicator, manual sync button
├── db/
│   ├── sqlite.ts              # SQLite (sql.js) initialization
│   ├── migrations/            # Schema migration files
│   ├── repositories/          # Data access layer per table
│   │   ├── ProductRepository.ts
│   │   ├── SaleRepository.ts
│   │   ├── PurchaseRepository.ts
│   │   ├── CustomerRepository.ts
│   │   ├── SupplierRepository.ts
│   │   └── SyncRepository.ts
│   └── triggers.ts            # Change tracking triggers
├── hooks/
│   ├── useDatabase.ts         # DB context/provider
│   ├── useProducts.ts
│   ├── useSales.ts
│   ├── usePurchases.ts
│   ├── useSync.ts
│   ├── useOnlineStatus.ts
│   └── useBarcode.ts
├── lib/
│   ├── utils.ts
│   ├── sync-engine.ts         # Core sync logic
│   ├── conflict-resolver.ts   # Conflict resolution
│   └── receipt-generator.ts   # PDF/print receipt
├── pages/
│   ├── Index.tsx              # Dashboard
│   ├── POS.tsx                # Point of Sale
│   ├── Inventory.tsx          # Stock management
│   ├── Products.tsx           # Product catalog
│   ├── Purchases.tsx          # Purchase orders
│   ├── Suppliers.tsx          # Supplier management
│   ├── Customers.tsx          # Customer management
│   ├── Reports.tsx            # Reports & analytics
│   ├── Settings.tsx           # App settings, sync config
│   └── Install.tsx            # PWA install prompt
├── services/
│   ├── api.ts                 # HTTP client with auth
│   └── sync-service.ts        # Sync orchestration
├── contexts/
│   ├── DatabaseContext.tsx
│   ├── AuthContext.tsx
│   └── SyncContext.tsx
├── types/
│   ├── database.ts            # DB record types
│   ├── sync.ts                # Sync types
│   └── api.ts                 # API types
├── sw/
│   └── sync-worker.ts         # Background sync logic
├── App.tsx
├── main.tsx
└── index.css
```

### 8.2 Module Responsibilities

| Module        | Responsibility                                              |
|--------------|--------------------------------------------------------------|
| `db/`        | SQLite init, migrations, CRUD repositories, change tracking  |
| `hooks/`     | React hooks wrapping DB operations and sync                  |
| `lib/`       | Pure business logic (sync, conflicts, receipts)              |
| `services/`  | Network/API communication                                    |
| `contexts/`  | React context providers for global state                     |
| `components/`| UI components organized by feature domain                    |
| `pages/`     | Route-level page components                                  |
| `sw/`        | Service worker background sync logic                         |

---

## 9. Security

### 9.1 Authentication

- Supabase Auth (email/password) with JWT tokens
- Tokens stored in memory (not localStorage for security)
- Refresh tokens for session continuity
- Offline: cached auth state allows continued local operations

### 9.2 Data Security

| Concern              | Solution                                          |
|---------------------|---------------------------------------------------|
| Data at rest         | SQLite in OPFS (origin-private, not user-accessible) |
| Data in transit      | HTTPS only                                        |
| Tenant isolation     | `pharmacy_id` on all records + RLS policies       |
| Role-based access    | Separate `user_roles` table, checked server-side  |
| Sensitive data       | No patient health records stored (regulatory)     |

### 9.3 RLS Policies (Server)

```sql
-- Users can only access their pharmacy's data
CREATE POLICY "pharmacy_isolation" ON products
  FOR ALL TO authenticated
  USING (pharmacy_id = (SELECT pharmacy_id FROM users WHERE id = auth.uid()))
  WITH CHECK (pharmacy_id = (SELECT pharmacy_id FROM users WHERE id = auth.uid()));
```

---

## 10. Future: Multi-Pharmacy Support

### 10.1 Design Decisions Already Made

- `pharmacy_id` on every business table
- User ↔ Pharmacy relationship
- RLS policies scoped to pharmacy
- Sync engine supports pharmacy-scoped sync

### 10.2 Future Additions

| Feature                    | Description                                    |
|---------------------------|------------------------------------------------|
| Pharmacy selector         | Switch between pharmacies in the UI            |
| Central dashboard         | Owner view across all pharmacies               |
| Inter-pharmacy transfers  | Stock transfer between locations               |
| Consolidated reporting    | Aggregated reports across pharmacies           |
| Pharmacy groups           | Group pharmacies under an organization         |

---

## Appendix A: Key Technical Decisions

| Decision                          | Rationale                                                |
|----------------------------------|----------------------------------------------------------|
| sql.js (WASM) over IndexedDB    | Relational queries, complex joins, familiar SQL syntax   |
| OPFS for SQLite storage          | Persistent, origin-private, good performance             |
| LWW conflict resolution          | Simple, predictable, sufficient for pharmacy operations  |
| Batch sync (not real-time)       | Works well with intermittent connectivity                |
| vite-plugin-pwa                  | Battle-tested PWA setup for Vite projects                |
| Supabase as backend              | Auth, Postgres, Edge Functions, Storage in one platform  |

## Appendix B: Sync Sequence Diagram

```
Client                          Server
  │                                │
  │──── POST /sync/push ──────────►│
  │     [batch of local changes]   │
  │                                │── Process & resolve conflicts
  │◄── { results, timestamp } ─────│
  │                                │
  │──── GET /sync/pull?since=T ───►│
  │                                │── Query changes since T
  │◄── { changes, cursor } ────────│
  │                                │
  │── Apply to local SQLite        │
  │── Update last_pull_timestamp   │
  │                                │
```

## Appendix C: Estimated Data Volumes (Per Pharmacy)

| Table              | Records/Month | Record Size | Monthly Growth |
|-------------------|---------------|-------------|----------------|
| products          | ~50 new       | ~500 bytes  | ~25 KB         |
| product_batches   | ~200          | ~300 bytes  | ~60 KB         |
| sales             | ~3,000        | ~400 bytes  | ~1.2 MB        |
| sale_items        | ~9,000        | ~200 bytes  | ~1.8 MB        |
| purchases         | ~50           | ~400 bytes  | ~20 KB         |
| sync_log          | ~15,000       | ~500 bytes  | ~7.5 MB (pruned after sync) |

Local SQLite should stay under **50 MB** with regular sync_log pruning.
