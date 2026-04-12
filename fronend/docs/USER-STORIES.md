# Pharmacy Management System — User Stories, Wireframes & Acceptance Criteria

---

## Table of Contents

1. [User Personas](#1-user-personas)
2. [Module: Authentication & Onboarding](#2-authentication--onboarding)
3. [Module: Dashboard](#3-dashboard)
4. [Module: Point of Sale (POS)](#4-point-of-sale-pos)
5. [Module: Inventory / Stock Management](#5-inventory--stock-management)
6. [Module: Purchase Management](#6-purchase-management)
7. [Module: Customer Management](#7-customer-management)
8. [Module: Supplier Management](#8-supplier-management)
9. [Module: Reports & Analytics](#9-reports--analytics)
10. [Module: Sync & Offline](#10-sync--offline)
11. [Module: Settings](#11-settings)
12. [Cross-Cutting Concerns](#12-cross-cutting-concerns)

---

## 1. User Personas

| Persona        | Role        | Goals                                                        | Pain Points                                      |
|---------------|-------------|--------------------------------------------------------------|--------------------------------------------------|
| **Amina**     | Pharmacist  | Dispense medicines quickly, check stock, verify expiry dates | Slow systems, no offline access, manual logs      |
| **David**     | Cashier     | Process sales fast, handle payments, print receipts          | Complex UIs, can't work when internet is down     |
| **Grace**     | Manager     | Track sales, monitor inventory, view reports, manage staff   | No real-time visibility, scattered spreadsheets   |
| **Dr. Owusu** | Owner       | See profits across pharmacies, ensure compliance             | No consolidated view, delayed financial reports   |

---

## 2. Authentication & Onboarding

### User Stories

| ID     | As a...   | I want to...                              | So that...                                    | Priority |
|--------|-----------|-------------------------------------------|-----------------------------------------------|----------|
| AU-01  | User      | Log in with email and password             | I can access the system securely              | P0       |
| AU-02  | User      | Stay logged in while offline               | I can continue working without internet       | P0       |
| AU-03  | Admin     | Invite new staff members via email         | They can access the pharmacy system           | P1       |
| AU-04  | Admin     | Assign roles to staff                      | Each person sees only what they need          | P1       |
| AU-05  | User      | Reset my password                          | I can regain access if I forget it            | P1       |
| AU-06  | New user  | See a guided onboarding on first login     | I understand how to use the app               | P2       |

### Wireframe Description — Login Screen

```
┌──────────────────────────────────────┐
│            [Pharmacy Logo]           │
│          Pharmacy Management         │
│                System                │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Email                          │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ Password              [👁]     │  │
│  └────────────────────────────────┘  │
│                                      │
│  [        Sign In (full-width)    ]  │
│                                      │
│         Forgot password?             │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  ● Online  │  ○ Offline mode  │  │
│  └────────────────────────────────┘  │
│  Status: Connected ✓                 │
└──────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] **AU-01**: User enters valid credentials → redirected to Dashboard. Invalid → error message shown inline.
- [ ] **AU-02**: After initial login, cached auth token allows offline access for up to 7 days.
- [ ] **AU-03**: Admin can invite users from Settings → Staff. Invited user receives email with setup link.
- [ ] **AU-04**: Roles: `admin`, `manager`, `pharmacist`, `cashier`. Each role has defined permissions (see Settings module).
- [ ] **AU-05**: "Forgot password" sends reset link via email (requires online).
- [ ] **AU-06**: First login triggers a 3-step tooltip tour highlighting key features.

---

## 3. Dashboard

### User Stories

| ID     | As a...   | I want to...                                  | So that...                                    | Priority |
|--------|-----------|-----------------------------------------------|-----------------------------------------------|----------|
| DA-01  | Manager   | See today's sales summary at a glance         | I know how the day is going                   | P0       |
| DA-02  | Manager   | See low stock and expiry alerts               | I can take action before problems occur       | P0       |
| DA-03  | Owner     | See revenue trends over time                  | I can track business growth                   | P1       |
| DA-04  | Pharmacist| See my pending tasks (returns, POs to receive)| I don't miss important work                   | P1       |
| DA-05  | User      | See sync status                               | I know if my data is up to date               | P0       |

### Wireframe Description — Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ [≡] PharmaSYS                              [🔔 3] [👤 Amina]│
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ Dashboard│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐│
│ ● POS    │  │Today Sale│ │ Orders   │ │ Low Stock│ │Expiry││
│ Inventory│  │ $12,450  │ │   47     │ │   12     │ │  5   ││
│ Products │  │ ↑ 8%     │ │ ↑ 3%    │ │ ⚠ Alert  │ │⚠ Soon││
│ Purchases│  └──────────┘ └──────────┘ └──────────┘ └──────┘│
│ Customers│                                                   │
│ Suppliers│  ┌─────────────────────────────────────────────┐  │
│ Reports  │  │          Sales Trend (7-day chart)          │  │
│ Settings │  │  $▲                                         │  │
│          │  │   ╱╲    ╱╲                                  │  │
│          │  │  ╱  ╲  ╱  ╲    ╱╲                          │  │
│          │  │ ╱    ╲╱    ╲  ╱  ╲                         │  │
│          │  │╱            ╲╱    ╲                         │  │
│          │  │  M  T  W  T  F  S  S                       │  │
│          │  └─────────────────────────────────────────────┘  │
│          │                                                   │
│          │  ┌─────────────────┐  ┌────────────────────────┐  │
│          │  │ Recent Sales    │  │ Alerts                 │  │
│          │  │ #1042 $23.50 ✓ │  │ ⚠ Paracetamol: 5 left │  │
│          │  │ #1041 $67.00 ✓ │  │ ⚠ Amoxicillin: exp 3d │  │
│          │  │ #1040 $12.75 ✓ │  │ ⚠ Ibuprofen: 8 left   │  │
│          │  └─────────────────┘  └────────────────────────┘  │
│          │                                                   │
│ ┌──────┐ │  Sync: ✓ Last synced 2 min ago    [Sync Now]     │
│ │Offline│ │                                                   │
│ └──────┘ │                                                   │
├──────────┴───────────────────────────────────────────────────┤
│ © 2026 PharmaSYS  │  v1.0.0  │  Pharmacy: MedPlus Central   │
└──────────────────────────────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] **DA-01**: KPI cards show: today's total sales ($), number of transactions, items sold, average sale value. Data sourced from local SQLite.
- [ ] **DA-02**: Alerts panel shows products below reorder level and products expiring within 30 days. Clicking an alert navigates to the product detail.
- [ ] **DA-03**: Line chart shows daily revenue for the past 7/30/90 days (toggle). Renders from local data.
- [ ] **DA-04**: Pending tasks section shows: unprocessed returns, POs awaiting receipt, unresolved sync conflicts.
- [ ] **DA-05**: Sync indicator shows: last sync time, sync status (synced/syncing/error/offline), pending changes count. "Sync Now" button triggers manual sync.

---

## 4. Point of Sale (POS)

### User Stories

| ID     | As a...   | I want to...                                    | So that...                                    | Priority |
|--------|-----------|------------------------------------------------|-----------------------------------------------|----------|
| PO-01  | Cashier   | Search products by name or barcode              | I can quickly find items to sell               | P0       |
| PO-02  | Cashier   | Add products to a cart                          | I can build an order                           | P0       |
| PO-03  | Cashier   | Adjust quantity of items in the cart             | I can correct mistakes or add multiples        | P0       |
| PO-04  | Cashier   | Apply a discount (% or flat) to a sale          | I can honor promotions or manager overrides    | P1       |
| PO-05  | Cashier   | Select payment method (cash/card/mobile/split)  | I can process different payment types          | P0       |
| PO-06  | Cashier   | See change due for cash payments                | I can give correct change                      | P0       |
| PO-07  | Cashier   | Print or share a receipt                        | The customer gets proof of purchase            | P0       |
| PO-08  | Cashier   | Put a sale on hold and resume later             | I can serve another customer in between        | P1       |
| PO-09  | Cashier   | Process a return/refund against a previous sale | I can handle customer returns                  | P1       |
| PO-10  | Cashier   | Access a "favorites" quick panel                | I can sell frequent items even faster          | P2       |
| PO-11  | Pharmacist| See if a product requires a prescription         | I comply with regulations                      | P1       |
| PO-12  | Cashier   | Complete a sale fully offline                   | Internet outages don't stop business           | P0       |

### Wireframe Description — POS Screen

```
┌──────────────────────────────────────────────────────────────┐
│ [≡] POS                          [Hold 2] [🔔] [👤 David]   │
├──────────────────────────────┬───────────────────────────────┤
│                              │                               │
│  🔍 Search products...       │   CART                        │
│  ┌─────────────────────────┐ │   ┌───────────────────────┐   │
│  │ ★ Favorites             │ │   │ Paracetamol 500mg     │   │
│  │ [Para..] [Amox.] [Ibup.]│ │   │ 2 × $3.50    = $7.00  │   │
│  └─────────────────────────┘ │   │ [−] [2] [+]    [🗑]   │   │
│                              │   ├───────────────────────┤   │
│  Category: [All ▼]          │   │ Amoxicillin 250mg  💊 │   │
│                              │   │ 1 × $12.00   = $12.00 │   │
│  ┌────────┐ ┌────────┐      │   │ [−] [1] [+]    [🗑]   │   │
│  │Paracet.│ │Amoxicil│      │   ├───────────────────────┤   │
│  │$3.50   │ │$12.00💊│      │   │                       │   │
│  │Stock:45│ │Stock:23│      │   │                       │   │
│  └────────┘ └────────┘      │   │                       │   │
│  ┌────────┐ ┌────────┐      │   │                       │   │
│  │Ibupro. │ │Vitamin │      │   ├───────────────────────┤   │
│  │$5.25   │ │$8.00   │      │   │ Subtotal:     $19.00  │   │
│  │Stock:67│ │Stock:34│      │   │ Discount:      -$0.00 │   │
│  └────────┘ └────────┘      │   │ Tax (0%):      $0.00  │   │
│                              │   │ ───────────────────── │   │
│  ◄ 1 2 3 ►                  │   │ TOTAL:        $19.00  │   │
│                              │   │                       │   │
│                              │   │ [Apply Discount]      │   │
│                              │   │                       │   │
│                              │   │ ┌───────────────────┐ │   │
│                              │   │ │   💳 PAY $19.00   │ │   │
│                              │   │ └───────────────────┘ │   │
│                              │   └───────────────────────┘   │
└──────────────────────────────┴───────────────────────────────┘
```

### Wireframe Description — Payment Dialog

```
┌────────────────────────────────┐
│       Payment — $19.00         │
│                                │
│  Payment Method:               │
│  [Cash ●] [Card] [Mobile]     │
│  [Split] [Credit]             │
│                                │
│  Amount Received:              │
│  ┌────────────────────────┐   │
│  │ $20.00                  │   │
│  └────────────────────────┘   │
│                                │
│  Change Due: $1.00             │
│                                │
│  Quick amounts:                │
│  [$19] [$20] [$50] [$100]     │
│                                │
│  Customer (optional):          │
│  [Search customer...      ▼]  │
│                                │
│  [Cancel]    [Complete Sale]   │
└────────────────────────────────┘
```

### Acceptance Criteria

- [ ] **PO-01**: Typing in search box filters products in <200ms. Barcode scan auto-fills search. Results show name, price, stock.
- [ ] **PO-02**: Clicking a product card or pressing Enter on search result adds it to cart with qty=1. If already in cart, increments quantity.
- [ ] **PO-03**: Cart items have +/- buttons and editable qty field. Qty=0 removes item. Cannot exceed available stock.
- [ ] **PO-04**: "Apply Discount" opens a dialog: choose % or $ discount, enter value. Discount reflected in total instantly.
- [ ] **PO-05**: Payment dialog shows method selector. Cash: shows amount received field and calculates change. Card/Mobile: shows reference field. Split: allows multiple payment entries summing to total.
- [ ] **PO-06**: Change = amount received − total. Displayed prominently in green if positive.
- [ ] **PO-07**: After sale completes, receipt dialog shows: sale number, items, totals, payment info, date/time, pharmacy details. Options: Print, Share (PDF), Done.
- [ ] **PO-08**: "Hold" button saves cart to `on_hold` sales. Badge shows count of held sales. Clicking opens list to resume.
- [ ] **PO-09**: "Returns" accessible from menu. Search by sale number → select items to return → refund processed → stock restored.
- [ ] **PO-10**: Favorites panel shows top 8 most-sold products. Configurable in settings.
- [ ] **PO-11**: Products requiring prescription show 💊 badge. Warning dialog before adding to cart.
- [ ] **PO-12**: All POS operations write to local SQLite. No network calls required. Sale completes in <500ms offline.

---

## 5. Inventory / Stock Management

### User Stories

| ID     | As a...     | I want to...                                     | So that...                                    | Priority |
|--------|-------------|--------------------------------------------------|-----------------------------------------------|----------|
| IN-01  | Pharmacist  | View all products with current stock levels       | I know what's available                        | P0       |
| IN-02  | Pharmacist  | Filter/sort products by category, stock, expiry   | I can find specific products quickly           | P0       |
| IN-03  | Manager     | Add a new product to the catalog                  | New medicines are available for sale           | P0       |
| IN-04  | Manager     | Edit product details (price, reorder level, etc.) | Information stays accurate                     | P0       |
| IN-05  | Pharmacist  | View batch details for a product                  | I can track expiry and lot numbers             | P0       |
| IN-06  | Manager     | Adjust stock manually with a reason               | I can correct discrepancies after stock counts | P1       |
| IN-07  | Pharmacist  | See all products expiring within 30/60/90 days    | I can pull and return expiring stock           | P0       |
| IN-08  | Manager     | See all products below reorder level              | I can create purchase orders proactively       | P0       |
| IN-09  | Manager     | Export inventory list to CSV                      | I can share with auditors or suppliers         | P2       |
| IN-10  | Manager     | View stock movement history for a product         | I can audit where stock went                   | P1       |

### Wireframe Description — Inventory List

```
┌──────────────────────────────────────────────────────────────┐
│ [≡] Inventory                              [+ Add Product]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 Search...   Category: [All ▼]   Stock: [All ▼]          │
│                                     [Low Stock] [Expiring]   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Product         │ Category  │ Stock │ Price  │ Status  │  │
│  ├─────────────────┼───────────┼───────┼────────┼─────────┤  │
│  │ Paracetamol 500 │ Analgesic │   45  │ $3.50  │ ✓ OK    │  │
│  │ Amoxicillin 250 │ Antibioti │   8   │ $12.00 │ ⚠ Low   │  │
│  │ Ibuprofen 400   │ Analgesic │   67  │ $5.25  │ ✓ OK    │  │
│  │ Metformin 500   │ Diabetes  │   3   │ $8.50  │ 🔴 Critical│
│  │ Omeprazole 20   │ GI        │   22  │ $6.00  │ ⏰ Exp30d│  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Showing 1-20 of 342 products      ◄ 1 2 3 ... 18 ►         │
│                                                              │
│  [📥 Export CSV]                                              │
└──────────────────────────────────────────────────────────────┘
```

### Wireframe Description — Product Detail / Edit

```
┌──────────────────────────────────────────────────────────────┐
│ [← Back] Product Detail                     [Edit] [Delete] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Paracetamol 500mg Tablets                                   │
│  Generic: Acetaminophen │ Barcode: 7891234567890             │
│  Category: Analgesics   │ Unit: Strip                        │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ Sell Price   │ │ Cost Price   │ │ Current Stock│          │
│  │   $3.50     │ │   $1.80     │ │     45       │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│  Reorder Level: 20  │  Max Stock: 500                        │
│  Requires Prescription: No                                   │
│                                                              │
│  ── Batches ──────────────────────────────────────────────   │
│  │ Batch#    │ Qty │ Cost  │ Expiry     │ Status           │ │
│  │ BT-20240  │  30 │ $1.80 │ 2026-09-15 │ ✓ OK             │ │
│  │ BT-20239  │  15 │ $1.75 │ 2026-04-10 │ ⏰ Expiring      │ │
│                                                              │
│  ── Stock Movement History ───────────────────────────────   │
│  │ Date       │ Type     │ Qty  │ Reference   │ By         │ │
│  │ 2026-03-08 │ Sale     │  -2  │ #SL-1042    │ David      │ │
│  │ 2026-03-07 │ Received │ +50  │ #PO-0089    │ Grace      │ │
│  │ 2026-03-05 │ Adjust   │  -3  │ Damaged     │ Grace      │ │
│                                                              │
│  [Adjust Stock]  [Create PO]                                 │
└──────────────────────────────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] **IN-01**: Inventory page loads all products from local SQLite with columns: name, category, stock, price, status. Paginated (20/page).
- [ ] **IN-02**: Search filters by name/barcode in <200ms. Category dropdown filters. Stock filter: All / Low / Critical / Expiring.
- [ ] **IN-03**: "Add Product" form: name (required), generic name, barcode, category (select), unit, sell price (required), cost price, reorder level, max stock, requires prescription (toggle). Validation before save.
- [ ] **IN-04**: Edit opens same form pre-filled. Changes saved to local SQLite + sync_log entry created.
- [ ] **IN-05**: Product detail page shows batch list with: batch#, qty, cost, expiry, status (OK / Expiring / Expired).
- [ ] **IN-06**: "Adjust Stock" dialog: select reason (Damage, Expired, Correction, Other), enter qty (+/-), optional note. Creates `stock_adjustments` record.
- [ ] **IN-07**: "Expiring" filter shows products with any batch expiring within selected window. Default 30 days.
- [ ] **IN-08**: "Low Stock" filter shows products where total batch qty < reorder_level.
- [ ] **IN-09**: Export generates CSV with all visible columns. Downloads immediately (no server needed).
- [ ] **IN-10**: Stock movement history shows all sales, purchases, adjustments for a product in reverse chronological order.

---

## 6. Purchase Management

### User Stories

| ID     | As a...   | I want to...                                      | So that...                                     | Priority |
|--------|-----------|---------------------------------------------------|------------------------------------------------|----------|
| PU-01  | Manager   | Create a purchase order for a supplier              | I can formally request stock                    | P0       |
| PU-02  | Manager   | Add multiple products to a purchase order           | I can order everything needed in one PO         | P0       |
| PU-03  | Manager   | Submit a purchase order (change status)             | The supplier knows what we need                 | P1       |
| PU-04  | Pharmacist| Receive goods against a purchase order              | Incoming stock is properly recorded             | P0       |
| PU-05  | Pharmacist| Receive partial deliveries                          | I can record what arrived without closing the PO | P1       |
| PU-06  | Manager   | View purchase history by supplier or date           | I can audit spending and track orders           | P1       |
| PU-07  | Manager   | Auto-generate a PO from low-stock products          | Reordering is fast and accurate                 | P2       |
| PU-08  | Manager   | Return goods to a supplier                          | Damaged/wrong items are formally returned       | P2       |

### Wireframe Description — Purchase Order Form

```
┌──────────────────────────────────────────────────────────────┐
│ [← Back] New Purchase Order                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  PO Number: PO-2026-0090 (auto)                              │
│                                                              │
│  Supplier: [Select supplier...          ▼]                   │
│  Expected Delivery: [📅 2026-03-15]                          │
│  Notes: [                                    ]               │
│                                                              │
│  ── Order Items ──────────────────────────────────────────   │
│  │ Product           │ Qty Ordered │ Unit Cost │ Total     │ │
│  │ [Search product ▼]│ [    50   ] │ [$1.80  ] │ $90.00   │ │
│  │ [Search product ▼]│ [   100   ] │ [$0.95  ] │ $95.00   │ │
│  │                   │             │           │           │ │
│  │ [+ Add Item]                                            │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │                              Order Total:  $185.00      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Save Draft]  [Submit Order]  [Cancel]                      │
└──────────────────────────────────────────────────────────────┘
```

### Wireframe Description — Goods Receiving

```
┌──────────────────────────────────────────────────────────────┐
│ [← Back] Receive Goods — PO-2026-0090                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Supplier: MedDistributors Ltd                               │
│  Order Date: 2026-03-08  │  Status: Submitted                │
│                                                              │
│  ── Items to Receive ─────────────────────────────────────   │
│  │ Product       │ Ordered │ Previously │ Receiving │ Batch │ │
│  │               │         │ Received   │ Now       │       │ │
│  │ Paracetamol   │   50    │     0      │ [  50  ]  │[BT#] │ │
│  │ Ibuprofen     │  100    │     0      │ [  80  ]  │[BT#] │ │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Batch Details (per item):                                   │
│  Batch Number: [          ]                                  │
│  Expiry Date:  [📅        ]                                  │
│  Manufacture:  [📅        ]                                  │
│                                                              │
│  [Receive & Close PO]  [Receive Partial]  [Cancel]           │
└──────────────────────────────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] **PU-01**: PO form: auto-generated PO number, supplier selector (required), expected date, notes. Saves as "draft".
- [ ] **PU-02**: Add items via product search. Each line: product, qty ordered, unit cost (pre-filled from product.cost_price), line total. Minimum 1 item.
- [ ] **PU-03**: "Submit" changes status from draft → submitted. Cannot edit submitted POs (only receive or cancel).
- [ ] **PU-04**: Goods receiving: for each PO item, enter qty received and batch details (batch#, expiry required). Creates `product_batches` records. Updates product stock.
- [ ] **PU-05**: Partial receive: PO status → "partial". Remaining qty trackable. Can receive again later.
- [ ] **PU-06**: Purchase list page: filterable by supplier, status, date range. Shows PO#, supplier, total, status, date.
- [ ] **PU-07**: "Auto PO" button: queries products below reorder level, pre-fills PO with those products (grouped by preferred supplier if set).
- [ ] **PU-08**: Purchase return: select received items → enter return qty and reason → stock adjusted → return record created.

---

## 7. Customer Management

### User Stories

| ID     | As a...   | I want to...                                   | So that...                                     | Priority |
|--------|-----------|------------------------------------------------|------------------------------------------------|----------|
| CU-01  | Cashier   | Add a new customer during checkout              | Their purchase is recorded under their profile | P1       |
| CU-02  | Manager   | View a customer's purchase history              | I can provide better service                   | P1       |
| CU-03  | Manager   | Set credit limits for customers                 | I control risk for credit sales                | P1       |
| CU-04  | Cashier   | Process a credit sale for a known customer      | Regular customers can pay later                | P1       |
| CU-05  | Manager   | View outstanding credit balances                | I know who owes money                          | P1       |
| CU-06  | Cashier   | Record a credit payment from a customer         | Their balance is updated                       | P1       |
| CU-07  | Manager   | Search customers by name or phone               | I can find records quickly                     | P0       |

### Wireframe Description — Customer List

```
┌──────────────────────────────────────────────────────────────┐
│ [≡] Customers                              [+ Add Customer]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 Search by name or phone...                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Name           │ Phone        │ Credit Bal │ Loyalty  │  │
│  ├────────────────┼──────────────┼────────────┼──────────┤  │
│  │ John Mensah    │ 024-555-0101 │    $0.00   │  120 pts │  │
│  │ Abena Osei     │ 020-555-0202 │  $145.00   │   85 pts │  │
│  │ Kwame Boateng  │ 027-555-0303 │   $50.00   │  200 pts │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Total Outstanding Credit: $195.00                           │
└──────────────────────────────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] **CU-01**: Quick-add customer from POS: name (required) + phone. Full details editable later.
- [ ] **CU-02**: Customer detail page shows: profile info, purchase history (table of sales), total spent, last visit date.
- [ ] **CU-03**: Credit limit field on customer profile. System prevents credit sale if it would exceed limit.
- [ ] **CU-04**: POS payment method "Credit" only available when a customer is selected. Sale amount added to `credit_balance`.
- [ ] **CU-05**: Customer list shows credit balance column. Filter: "With Balance" shows customers where credit_balance > 0.
- [ ] **CU-06**: "Record Payment" button on customer profile: enter amount, payment method. Reduces `credit_balance`.
- [ ] **CU-07**: Search filters customer list by name or phone in <200ms.

---

## 8. Supplier Management

### User Stories

| ID     | As a...   | I want to...                                   | So that...                                     | Priority |
|--------|-----------|------------------------------------------------|------------------------------------------------|----------|
| SU-01  | Manager   | Add a new supplier                              | I can create POs for them                       | P0       |
| SU-02  | Manager   | Edit supplier details                           | Information stays current                       | P1       |
| SU-03  | Manager   | View purchase history with a supplier           | I can evaluate the relationship                 | P1       |
| SU-04  | Manager   | Deactivate a supplier                           | They don't appear in new PO forms              | P2       |
| SU-05  | Manager   | Associate products with preferred suppliers     | Auto-PO knows which supplier to use            | P2       |

### Wireframe Description — Supplier List

```
┌──────────────────────────────────────────────────────────────┐
│ [≡] Suppliers                              [+ Add Supplier]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 Search...                                                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Name              │ Contact      │ Terms   │ Status   │  │
│  ├───────────────────┼──────────────┼─────────┼──────────┤  │
│  │ MedDistributors   │ 030-555-1111 │ Net 30  │ Active   │  │
│  │ PharmaWholesale   │ 024-555-2222 │ Net 15  │ Active   │  │
│  │ GlobalMeds Ltd    │ 020-555-3333 │ COD     │ Inactive │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Active: 12  │  Inactive: 3                                  │
└──────────────────────────────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] **SU-01**: Add supplier form: name (required), contact person, phone, email, address, payment terms. Saved to local SQLite.
- [ ] **SU-02**: Edit form pre-filled with existing data. Changes logged to sync_log.
- [ ] **SU-03**: Supplier detail page shows: profile info, list of POs (with status and total), total spend with supplier.
- [ ] **SU-04**: "Deactivate" sets `is_active = 0`. Inactive suppliers hidden from PO supplier dropdown but still visible in supplier list with filter.
- [ ] **SU-05**: Product form has optional "Preferred Supplier" field. Auto-PO groups products by preferred supplier.

---

## 9. Reports & Analytics

### User Stories

| ID     | As a...   | I want to...                                       | So that...                                     | Priority |
|--------|-----------|---------------------------------------------------|------------------------------------------------|----------|
| RE-01  | Manager   | View daily/weekly/monthly sales reports             | I can track revenue trends                      | P0       |
| RE-02  | Manager   | See sales breakdown by product or category          | I know what sells best                          | P1       |
| RE-03  | Manager   | View profit margins per product                     | I can optimize pricing                          | P1       |
| RE-04  | Manager   | Generate an inventory valuation report              | I know the value of current stock               | P1       |
| RE-05  | Owner     | See expense report (purchases by period)            | I can track spending                            | P1       |
| RE-06  | Manager   | View staff sales performance                        | I can evaluate and incentivize staff             | P2       |
| RE-07  | Manager   | Export any report to CSV or PDF                     | I can share with stakeholders                    | P1       |
| RE-08  | Manager   | See a stock aging report                            | I can identify slow-moving inventory             | P2       |
| RE-09  | Owner     | View a P&L summary (revenue - COGS)                | I understand profitability                       | P1       |

### Wireframe Description — Reports Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ [≡] Reports                                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Period: [This Month ▼]  From: [📅] To: [📅]  [Apply]       │
│                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Revenue     │ │ COGS        │ │ Gross Profit│            │
│  │ $45,200     │ │ $28,100     │ │ $17,100     │            │
│  │ ↑ 12%       │ │ ↑ 8%        │ │ ↑ 18%       │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Revenue vs COGS (Bar chart by week)                 │    │
│  │  ██ Revenue  ░░ COGS                                 │    │
│  │  ██░░  ██░░  ██░░  ██░░                              │    │
│  │  Wk1   Wk2   Wk3   Wk4                              │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────┐ ┌────────────────────────────┐  │
│  │ Top 10 Products (Sales) │ │ Sales by Category (Pie)    │  │
│  │ 1. Paracetamol   $4,200 │ │       ╭───╮               │  │
│  │ 2. Amoxicillin   $3,100 │ │     ╱Anal.╲              │  │
│  │ 3. Metformin     $2,800 │ │    │ 35%   │Antibio│      │  │
│  │ ...                     │ │     ╲     ╱  25%         │  │
│  └─────────────────────────┘ │       ╰───╯               │  │
│                              └────────────────────────────┘  │
│                                                              │
│  Quick Reports:                                              │
│  [Sales Report] [Inventory Valuation] [Expiry Report]        │
│  [Purchase Report] [Staff Performance] [P&L Summary]         │
│                                                              │
│  [📥 Export CSV]  [📄 Export PDF]                             │
└──────────────────────────────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] **RE-01**: Sales report shows: date, #transactions, total revenue, avg sale. Groupable by day/week/month. Filterable by date range.
- [ ] **RE-02**: Product sales report: product name, qty sold, revenue, % of total. Sortable by any column. Category view aggregates products.
- [ ] **RE-03**: Profit report: product, sell price, cost price, margin %, total profit. Calculated from sale_items joined with products.
- [ ] **RE-04**: Inventory valuation: product, qty on hand, avg cost, total value. Grand total at bottom. Method: weighted average.
- [ ] **RE-05**: Purchase report: supplier, #POs, total spent, avg PO value. Filterable by date range and supplier.
- [ ] **RE-06**: Staff report: user name, #sales, total revenue, avg sale, #returns. Filterable by date range.
- [ ] **RE-07**: CSV export downloads immediately (generated client-side). PDF uses browser print or jsPDF.
- [ ] **RE-08**: Stock aging: product, qty, days since last sale, days since received. Highlights items with no sales in 90+ days.
- [ ] **RE-09**: P&L summary: Total Revenue − COGS = Gross Profit. Shows % margin. Compares to previous period.
- [ ] All reports run entirely from local SQLite. No server dependency.

---

## 10. Sync & Offline

### User Stories

| ID     | As a...     | I want to...                                      | So that...                                      | Priority |
|--------|-------------|--------------------------------------------------|------------------------------------------------|----------|
| SY-01  | User        | See whether I'm online or offline                 | I know if my data is syncing                    | P0       |
| SY-02  | User        | See how many changes are pending sync             | I know if there's unsent data                   | P0       |
| SY-03  | User        | Manually trigger a sync                           | I can ensure data is sent before closing the app | P0       |
| SY-04  | Manager     | Be notified of sync conflicts                     | I can resolve data discrepancies                | P1       |
| SY-05  | User        | Continue all operations while offline              | Internet outages never stop my work             | P0       |
| SY-06  | User        | Have my data automatically sync when back online   | I don't have to remember to sync manually       | P0       |
| SY-07  | Manager     | See sync history/log                              | I can audit what was synced and when            | P2       |
| SY-08  | User        | Install the app to my device home screen           | I can access it like a native app               | P1       |

### Wireframe Description — Sync Status Bar

```
Persistent bottom bar or header indicator:

┌──────────────────────────────────────────────────────────┐
│ ● Online  │  ✓ Synced  │  Last: 2 min ago  │ [Sync Now] │
└──────────────────────────────────────────────────────────┘

When offline:
┌──────────────────────────────────────────────────────────┐
│ ○ Offline │  ⏳ 23 pending │  Last: 45 min ago │  [—]    │
└──────────────────────────────────────────────────────────┘

When syncing:
┌──────────────────────────────────────────────────────────┐
│ ● Online  │  ⟳ Syncing (12/23)...  │  [Cancel]          │
└──────────────────────────────────────────────────────────┘

When conflict:
┌──────────────────────────────────────────────────────────┐
│ ● Online  │  ⚠ 2 conflicts  │  [Review]  │  [Sync Now]  │
└──────────────────────────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] **SY-01**: Status indicator visible on all pages. Shows: Online (green) / Offline (gray). Updates within 3 seconds of connectivity change.
- [ ] **SY-02**: Pending count = `SELECT COUNT(*) FROM sync_log WHERE synced = 0`. Updates after every write operation.
- [ ] **SY-03**: "Sync Now" button triggers immediate push + pull. Disabled when offline. Shows progress (x/y).
- [ ] **SY-04**: Conflicts shown in a review panel: local vs server values side-by-side. User can choose "Keep Mine", "Keep Server", or "Merge".
- [ ] **SY-05**: Every feature (POS, inventory, purchases, reports) works identically offline. All reads/writes go to local SQLite.
- [ ] **SY-06**: On `online` event, automatic sync triggers within 5 seconds. Also runs on periodic interval (every 5 min while online).
- [ ] **SY-07**: Sync log page shows: timestamp, direction (push/pull), records synced, status (success/error), duration.
- [ ] **SY-08**: Install prompt shown on `/install` page. Works on Chrome Android (beforeinstallprompt) and Safari iOS (manual instructions).

---

## 11. Settings

### User Stories

| ID     | As a...   | I want to...                                    | So that...                                     | Priority |
|--------|-----------|------------------------------------------------|------------------------------------------------|----------|
| SE-01  | Admin     | Configure pharmacy details (name, address, etc.)| Receipts and reports show correct info          | P0       |
| SE-02  | Admin     | Manage staff accounts and roles                  | I control who can do what                       | P1       |
| SE-03  | Admin     | Configure receipt template                       | Receipts match our branding                    | P2       |
| SE-04  | Manager   | Set tax rate                                     | Tax is calculated correctly on sales           | P1       |
| SE-05  | Manager   | Configure alert thresholds (expiry days, stock)  | Alerts are relevant to our needs               | P2       |
| SE-06  | Admin     | View app version and storage usage               | I can monitor the app's health                  | P1       |
| SE-07  | Admin     | Clear local data and re-sync                     | I can recover from data issues                  | P2       |

### Wireframe Description — Settings

```
┌──────────────────────────────────────────────────────────────┐
│ [≡] Settings                                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── Pharmacy ──────────────────────────────────────────────  │
│  Name:     [MedPlus Central Pharmacy        ]                │
│  Address:  [123 Main Street, Accra          ]                │
│  Phone:    [030-555-1234                    ]                │
│  License:  [PH-2024-00567                   ]                │
│  [Save Changes]                                              │
│                                                              │
│  ── Sales & Tax ───────────────────────────────────────────  │
│  Tax Rate: [0] %    Tax Name: [VAT          ]                │
│  Default Payment Method: [Cash ▼]                            │
│                                                              │
│  ── Alerts ────────────────────────────────────────────────  │
│  Expiry Warning: [30 ▼] days before expiry                   │
│  Low Stock Threshold: Use product-level reorder levels ✓     │
│                                                              │
│  ── Staff Management ─────────────────────────────────────   │
│  │ Name         │ Email              │ Role       │ Status │ │
│  │ David Asante │ david@medplus.com  │ Cashier    │ Active │ │
│  │ Amina Yusuf  │ amina@medplus.com  │ Pharmacist │ Active │ │
│  │ [+ Invite Staff]                                        │ │
│                                                              │
│  ── System ────────────────────────────────────────────────  │
│  App Version: 1.0.0                                          │
│  Local Storage: 12.3 MB / 50 MB                              │
│  Sync Log Entries: 1,204 (synced: 1,181 / pending: 23)       │
│  [Clear Synced Logs]  [Reset & Re-sync ⚠]                   │
└──────────────────────────────────────────────────────────────┘
```

### Acceptance Criteria

- [ ] **SE-01**: Pharmacy details form saves to `pharmacy` table. Fields shown on receipts.
- [ ] **SE-02**: Staff list shows all users for this pharmacy. Admin can: invite (email), change role (dropdown), deactivate (toggle).
- [ ] **SE-03**: Receipt template: configurable header text, footer text, show/hide pharmacy logo. Preview available.
- [ ] **SE-04**: Tax rate stored in settings. Applied to all new sales. Display on receipt.
- [ ] **SE-05**: Expiry warning days: 30/60/90 dropdown. Affects dashboard alerts and inventory expiry filter.
- [ ] **SE-06**: Shows app version from package.json, estimated SQLite storage size, sync log stats.
- [ ] **SE-07**: "Reset & Re-sync" requires confirmation dialog with typed confirmation ("RESET"). Drops local SQLite, re-pulls all data from server. Only available when online.

---

## 12. Cross-Cutting Concerns

### 12.1 Permissions Matrix

| Feature                | Admin | Manager | Pharmacist | Cashier |
|-----------------------|-------|---------|------------|---------|
| POS — Sell            | ✓     | ✓       | ✓          | ✓       |
| POS — Apply discount  | ✓     | ✓       | ✗          | ✗       |
| POS — Process return  | ✓     | ✓       | ✓          | ✗       |
| Inventory — View      | ✓     | ✓       | ✓          | ✓ (read)|
| Inventory — Add/Edit  | ✓     | ✓       | ✗          | ✗       |
| Inventory — Adjust    | ✓     | ✓       | ✓          | ✗       |
| Purchases — Create PO | ✓     | ✓       | ✗          | ✗       |
| Purchases — Receive   | ✓     | ✓       | ✓          | ✗       |
| Customers — View      | ✓     | ✓       | ✓          | ✓       |
| Customers — Credit    | ✓     | ✓       | ✗          | ✗       |
| Reports — View        | ✓     | ✓       | ✗          | ✗       |
| Reports — Export      | ✓     | ✓       | ✗          | ✗       |
| Settings — Pharmacy   | ✓     | ✗       | ✗          | ✗       |
| Settings — Staff      | ✓     | ✗       | ✗          | ✗       |
| Settings — Tax/Alerts | ✓     | ✓       | ✗          | ✗       |
| Sync — Manual sync    | ✓     | ✓       | ✓          | ✓       |
| Sync — Review conflicts| ✓    | ✓       | ✗          | ✗       |
| Sync — Reset          | ✓     | ✗       | ✗          | ✗       |

### 12.2 Navigation Structure

```
Sidebar:
├── Dashboard
├── POS
├── Inventory
│   ├── Products
│   └── Stock Adjustments
├── Purchases
│   ├── Purchase Orders
│   └── Goods Receiving
├── Customers
├── Suppliers
├── Reports
│   ├── Sales Reports
│   ├── Inventory Reports
│   ├── Purchase Reports
│   └── P&L Summary
└── Settings
    ├── Pharmacy
    ├── Staff
    └── System
```

### 12.3 Error Handling Strategy

| Scenario                     | User Experience                                        |
|-----------------------------|--------------------------------------------------------|
| Network request fails       | Toast: "Offline — changes saved locally"               |
| SQLite write fails          | Error dialog with retry option. Log to console.        |
| Sync conflict               | Badge on sync indicator. Review panel accessible.      |
| Invalid form input          | Inline field validation with error messages.           |
| Stock insufficient for sale | Toast: "Only X in stock". Prevent adding to cart.      |
| Credit limit exceeded       | Dialog: "Credit limit exceeded by $X. Proceed?"       |
| Session expired (online)    | Redirect to login. Local operations still work.        |

### 12.4 Performance Targets

| Metric                       | Target              |
|-----------------------------|---------------------|
| Initial app load (cached)   | < 1 second          |
| POS product search          | < 200ms             |
| Sale completion (offline)   | < 500ms             |
| Page navigation             | < 300ms             |
| Report generation (local)   | < 2 seconds         |
| Sync batch (50 records)     | < 5 seconds         |
| SQLite DB size (per pharmacy)| < 50 MB            |

### 12.5 Accessibility

- All interactive elements keyboard-navigable
- ARIA labels on icons and status indicators
- Minimum contrast ratio 4.5:1 (WCAG AA)
- Responsive: works on 768px+ (tablet) and 1024px+ (desktop)
- Touch targets minimum 44×44px for POS components

### 12.6 Testing Strategy

| Level          | Tool            | Coverage Target |
|---------------|-----------------|-----------------|
| Unit tests    | Vitest          | DB repositories, sync engine, conflict resolver |
| Component     | Testing Library | All form components, POS cart, payment dialog    |
| Integration   | Vitest + SQLite | Full sale flow, purchase flow, sync flow         |
| E2E           | Playwright      | Critical paths: login → sell → sync              |
| Offline       | Manual + SW mock| All features work without network                |

---

## Appendix: Glossary

| Term            | Definition                                                    |
|----------------|---------------------------------------------------------------|
| POS            | Point of Sale — the checkout/sales interface                  |
| PO             | Purchase Order — formal order to a supplier                   |
| COGS           | Cost of Goods Sold — total cost of products sold in a period  |
| LWW            | Last Write Wins — conflict resolution where latest edit wins  |
| OPFS           | Origin Private File System — secure browser storage           |
| RLS            | Row Level Security — database-level access control            |
| Batch          | A specific lot of a product with its own expiry and cost      |
| FIFO           | First In First Out — inventory valuation method               |
| Reorder Level  | Minimum stock qty that triggers a restock alert               |
