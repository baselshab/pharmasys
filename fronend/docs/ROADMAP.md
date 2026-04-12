# Pharmacy Management System — Implementation Roadmap

---

## Overview

This roadmap organizes all documented features into **3 phases** based on priority levels (P0 → P1 → P2) from the user stories. Each phase has clear milestones, deliverables, estimated effort, and exit criteria.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   MVP (P0)              V1 (P1)                V2 (P2)             │
│   ─────────             ──────                 ──────              │
│   Core offline          Full business          Advanced &          │
│   POS + Inventory       operations             optimization        │
│                                                                     │
│   Weeks 1–6             Weeks 7–12             Weeks 13–18         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: MVP (Weeks 1–6)

> **Goal:** A working offline-first POS with inventory, local SQLite, and basic sync. A single pharmacy can sell products, track stock, and sync when online.

### Sprint 1 — Foundation (Week 1–2)

| Task                                    | Stories    | Est.  | Notes                                        |
|-----------------------------------------|-----------|-------|----------------------------------------------|
| Design system setup (colors, typography, tokens) | —  | 3h    | Tailwind config, index.css, component variants |
| App shell with sidebar navigation        | —         | 4h    | Layout, responsive sidebar, route structure   |
| PWA configuration (vite-plugin-pwa)      | SY-08     | 4h    | Manifest, service worker, precaching, icons   |
| SQLite (sql.js WASM) initialization      | —         | 6h    | OPFS storage, DB provider context, migrations |
| Core schema migration (all tables)       | —         | 4h    | Run DDL from docs/README.md schema           |
| Auth flow (login, offline session)       | AU-01, AU-02 | 6h | Supabase auth, cached tokens, offline gate   |
| Repository layer (base CRUD class)       | —         | 4h    | Generic SQLite repository with type safety    |

**Sprint 1 Deliverable:** App loads offline, user can log in, SQLite initialized with schema.

### Sprint 2 — POS Core (Week 3–4)

| Task                                    | Stories              | Est.  | Notes                                   |
|-----------------------------------------|---------------------|-------|------------------------------------------|
| Product repository + seed data           | —                   | 3h    | CRUD + search + barcode lookup           |
| Product search component                 | PO-01               | 4h    | Debounced search, category filter        |
| Cart component                          | PO-02, PO-03        | 6h    | Add/remove, qty adjust, totals          |
| Payment dialog                          | PO-05, PO-06        | 5h    | Cash/card/mobile, change calculation     |
| Sale completion + receipt                | PO-07               | 5h    | Write to sales + sale_items, receipt UI  |
| Sale repository                         | PO-12               | 3h    | Insert sale + items + update batch qty   |
| Offline POS validation                   | PO-12               | 2h    | Verify full flow works without network   |

**Sprint 2 Deliverable:** Complete POS flow — search → cart → pay → receipt — fully offline.

### Sprint 3 — Inventory + Sync + Dashboard (Week 5–6)

| Task                                    | Stories              | Est.  | Notes                                   |
|-----------------------------------------|---------------------|-------|------------------------------------------|
| Inventory list page                      | IN-01, IN-02        | 5h    | Table with search, filters, pagination   |
| Product add/edit form                    | IN-03, IN-04        | 4h    | Full form with validation                |
| Batch viewing                           | IN-05               | 3h    | Batch list on product detail             |
| Low stock + expiry alerts                | IN-07, IN-08        | 3h    | Filter queries, alert badges             |
| Sync engine — change tracker             | —                   | 6h    | sync_log writes on every mutation        |
| Sync engine — push (local → server)      | SY-06               | 6h    | Batch upload, retry, mark synced         |
| Sync engine — pull (server → local)      | SY-06               | 5h    | Delta pull, upsert to local SQLite       |
| Sync status indicator                    | SY-01, SY-02, SY-03 | 3h    | Online/offline badge, pending count, sync button |
| Dashboard — KPI cards + alerts           | DA-01, DA-02, DA-05  | 5h    | Today's sales, low stock, expiry, sync status |

**Sprint 3 Deliverable:** Inventory management, working sync, and dashboard. **MVP complete.**

### MVP Exit Criteria

- [ ] User can log in and remain authenticated offline for 7 days
- [ ] POS: search → add to cart → pay (cash) → receipt — works fully offline
- [ ] Inventory: view all products, filter by low stock / expiring, add/edit product
- [ ] Batch tracking: view batches per product with expiry dates
- [ ] Sync: local changes pushed to server when online, server changes pulled
- [ ] Sync status visible on all pages (online/offline, pending count, last sync time)
- [ ] Dashboard: today's sales KPI, low stock alerts, expiry alerts
- [ ] PWA: installable, works offline, app shell cached
- [ ] All data persisted in local SQLite (survives browser close)
- [ ] Performance: POS search < 200ms, sale completion < 500ms

---

## Phase 2: V1 — Full Business Operations (Weeks 7–12)

> **Goal:** Complete business workflow with purchases, customer/supplier management, credit sales, reports, staff roles, and conflict resolution.

### Sprint 4 — Purchases + Suppliers (Week 7–8)

| Task                                    | Stories              | Est.  | Notes                                   |
|-----------------------------------------|---------------------|-------|------------------------------------------|
| Supplier CRUD + list page                | SU-01, SU-02        | 4h    | Form, table, search                      |
| Supplier detail + purchase history       | SU-03               | 3h    | PO list per supplier, total spend        |
| Purchase order form                      | PU-01, PU-02        | 6h    | Multi-item form, auto-totals            |
| PO status workflow (draft → submit)      | PU-03               | 3h    | Status transitions, validation           |
| Goods receiving                          | PU-04, PU-05        | 6h    | Receive against PO, batch creation, partial receive |
| Purchase list page                       | PU-06               | 3h    | Filter by supplier, status, date         |
| Stock movement history                   | IN-10               | 4h    | Aggregate sales, purchases, adjustments per product |

**Sprint 4 Deliverable:** Full purchase cycle — create PO → submit → receive goods → stock updated.

### Sprint 5 — Customers + Advanced POS (Week 9–10)

| Task                                    | Stories              | Est.  | Notes                                   |
|-----------------------------------------|---------------------|-------|------------------------------------------|
| Customer CRUD + list page                | CU-01, CU-07        | 4h    | Form, table, search by name/phone        |
| Customer purchase history                | CU-02               | 3h    | Sales list per customer, total spent      |
| Credit management                        | CU-03, CU-04, CU-05, CU-06 | 6h | Credit limits, credit sales, payment recording |
| POS — discount application               | PO-04               | 3h    | % or $ discount dialog                   |
| POS — hold/resume sale                   | PO-08               | 4h    | Park sale, badge count, resume list       |
| POS — returns/refunds                    | PO-09               | 5h    | Search sale, select items, refund, restock |
| Prescription flag                        | PO-11               | 2h    | Badge on product, warning dialog          |
| Stock adjustments                        | IN-06               | 3h    | Adjust dialog with reason codes           |
| Role-based access control                | AU-04               | 5h    | Permissions matrix enforcement on UI      |

**Sprint 5 Deliverable:** Customer management, credit sales, returns, discounts, and role-based permissions.

### Sprint 6 — Reports + Polish (Week 11–12)

| Task                                    | Stories              | Est.  | Notes                                   |
|-----------------------------------------|---------------------|-------|------------------------------------------|
| Reports dashboard layout                 | —                   | 3h    | Period selector, KPI cards, chart area    |
| Sales reports (daily/weekly/monthly)     | RE-01               | 5h    | Grouped queries, line/bar charts          |
| Product/category sales breakdown         | RE-02               | 4h    | Pie chart, sortable table                |
| Profit margin report                     | RE-03               | 4h    | sell_price vs cost_price analysis         |
| Inventory valuation report               | RE-04               | 3h    | Weighted average, grand total             |
| Purchase/expense report                  | RE-05               | 3h    | Spend by supplier, by period              |
| P&L summary                            | RE-09               | 4h    | Revenue - COGS = Gross Profit, % margin   |
| CSV export (client-side)                 | RE-07               | 3h    | Generate and download for any report      |
| Dashboard — revenue trends               | DA-03               | 3h    | 7/30/90 day line chart                    |
| Dashboard — pending tasks                | DA-04               | 2h    | Returns, POs to receive                   |
| Sync conflict review panel               | SY-04               | 5h    | Side-by-side comparison, resolve actions  |
| Password reset flow                      | AU-05               | 2h    | Email-based reset (online only)           |
| Staff invite flow                        | AU-03               | 3h    | Email invite from settings                |

**Sprint 6 Deliverable:** Full reporting suite, conflict resolution, staff management. **V1 complete.**

### V1 Exit Criteria

- [ ] All MVP criteria still passing
- [ ] Purchases: create PO → submit → receive (full & partial) → stock updated
- [ ] Suppliers: CRUD, purchase history, deactivation
- [ ] Customers: CRUD, purchase history, credit sales, credit payments
- [ ] POS: discounts, hold/resume, returns/refunds, prescription warnings
- [ ] Stock adjustments with reason codes
- [ ] Reports: sales, profit, inventory valuation, purchases, P&L — all from local SQLite
- [ ] CSV export for all reports
- [ ] Role-based permissions enforced (admin/manager/pharmacist/cashier)
- [ ] Sync conflicts reviewable and resolvable by manager/admin
- [ ] Staff invite and password reset functional (online)
- [ ] Dashboard: revenue trends, pending tasks, full alert system

---

## Phase 3: V2 — Advanced & Optimization (Weeks 13–18)

> **Goal:** Polish, advanced features, performance optimization, and groundwork for multi-pharmacy.

### Sprint 7 — Advanced Features (Week 13–14)

| Task                                    | Stories              | Est.  | Notes                                   |
|-----------------------------------------|---------------------|-------|------------------------------------------|
| POS favorites/quick panel                | PO-10               | 3h    | Top 8 products, configurable             |
| Auto-generate PO from low stock          | PU-07               | 4h    | Query low stock, pre-fill PO by supplier |
| Purchase returns                         | PU-08               | 4h    | Return goods to supplier workflow        |
| Supplier deactivation                    | SU-04               | 2h    | Soft delete, hide from PO forms          |
| Product-supplier association             | SU-05               | 3h    | Preferred supplier field on product       |
| Staff performance report                 | RE-06               | 4h    | Sales by user, targets                   |
| Stock aging report                       | RE-08               | 3h    | Days since last sale, slow movers        |
| Inventory CSV export                     | IN-09               | 2h    | Export visible inventory to CSV          |
| Onboarding tour                          | AU-06               | 3h    | 3-step tooltip tour for new users        |

**Sprint 7 Deliverable:** Advanced POS, auto-purchasing, and extended reports.

### Sprint 8 — Settings + Polish (Week 15–16)

| Task                                    | Stories              | Est.  | Notes                                   |
|-----------------------------------------|---------------------|-------|------------------------------------------|
| Pharmacy settings form                   | SE-01               | 3h    | Name, address, license on receipts       |
| Tax configuration                        | SE-04               | 3h    | Tax rate applied to all new sales        |
| Alert threshold settings                 | SE-05               | 2h    | Configurable expiry warning days         |
| Receipt template configuration           | SE-03               | 4h    | Header/footer text, preview              |
| App info & storage usage                 | SE-06               | 2h    | Version, SQLite size, sync stats         |
| Reset & re-sync                          | SE-07               | 4h    | Destructive reset with confirmation      |
| Sync history log                         | SY-07               | 3h    | Timestamp, direction, records, status    |
| PDF export for reports                   | RE-07               | 5h    | jsPDF or browser print for reports       |
| Performance optimization                 | —                   | 6h    | Query optimization, lazy loading, virtualized lists |
| Accessibility audit + fixes              | —                   | 4h    | Keyboard nav, ARIA, contrast             |

**Sprint 8 Deliverable:** Full settings, PDF reports, performance + accessibility polish.

### Sprint 9 — Multi-Pharmacy Groundwork + Testing (Week 17–18)

| Task                                    | Stories              | Est.  | Notes                                   |
|-----------------------------------------|---------------------|-------|------------------------------------------|
| Multi-pharmacy data isolation            | —                   | 5h    | Enforce pharmacy_id on all queries       |
| Pharmacy selector UI (for owners)        | —                   | 4h    | Switch between pharmacies                |
| Server-side RLS policies                 | —                   | 4h    | Pharmacy-scoped row-level security       |
| E2E test suite (critical paths)          | —                   | 8h    | Login, POS flow, sync, purchase flow     |
| Offline test suite                       | —                   | 4h    | All features verified without network    |
| Unit + integration tests                 | —                   | 8h    | Repositories, sync engine, conflict resolver |
| Bug fixes & stabilization                | —                   | 8h    | Buffer for issues found during testing   |
| Documentation updates                    | —                   | 3h    | User guide, API docs, deployment guide   |

**Sprint 9 Deliverable:** Multi-pharmacy ready, comprehensive test coverage. **V2 complete.**

### V2 Exit Criteria

- [ ] All V1 criteria still passing
- [ ] POS favorites panel functional
- [ ] Auto-PO generation from low stock
- [ ] Purchase returns to supplier
- [ ] Full settings: pharmacy info, tax, alerts, receipt template, system info
- [ ] Reset & re-sync working with safety confirmation
- [ ] Sync history viewable
- [ ] PDF export for all reports
- [ ] All performance targets met (see docs/USER-STORIES.md §12.4)
- [ ] Accessibility: keyboard navigation, ARIA labels, contrast ≥ 4.5:1
- [ ] Multi-pharmacy: data isolation, pharmacy selector for owners
- [ ] RLS policies enforced on server
- [ ] Test coverage: unit tests for core logic, E2E for critical paths
- [ ] Offline verified: all features work without network

---

## Effort Summary

| Phase | Sprints | Duration  | Estimated Hours | Key Deliverables                         |
|-------|---------|-----------|----------------|------------------------------------------|
| MVP   | 1–3     | 6 weeks   | ~135 hours     | Offline POS, inventory, sync, dashboard  |
| V1    | 4–6     | 6 weeks   | ~150 hours     | Purchases, customers, reports, roles     |
| V2    | 7–9     | 6 weeks   | ~140 hours     | Advanced features, settings, multi-pharmacy, tests |
| **Total** |     | **18 weeks** | **~425 hours** |                                        |

---

## Risk Register

| Risk                                    | Impact | Likelihood | Mitigation                                    |
|-----------------------------------------|--------|------------|-----------------------------------------------|
| sql.js WASM performance on low-end devices | High | Medium   | Benchmark early, optimize queries, consider pagination |
| OPFS browser support gaps                | High   | Low        | Fallback to IndexedDB-backed storage           |
| Sync conflicts cause data loss           | High   | Medium     | Comprehensive conflict resolution + manual review |
| SQLite DB exceeds 50MB on busy pharmacies | Medium | Medium   | Aggressive sync_log pruning, archival strategy  |
| Offline auth token expiry                | Medium | Medium     | 7-day token TTL, re-auth required when online  |
| Service worker update breaks cache       | High   | Low        | Versioned precache, skipWaiting with user prompt |
| Complex POS interactions on mobile       | Medium | Medium     | Tablet-first design, test on real devices early |

---

## Dependencies & Prerequisites

### Before MVP Sprint 1

- [ ] Lovable Cloud (Supabase) enabled
- [ ] Design system finalized (colors, fonts, component tokens)
- [ ] sql.js WASM binary hosted/bundled
- [ ] PWA icons generated (192px, 512px, maskable)

### Before V1 Sprint 4

- [ ] Server-side sync API endpoints deployed (Edge Functions)
- [ ] Supabase tables created (mirrors local schema)
- [ ] Basic RLS policies in place

### Before V2 Sprint 9

- [ ] Multi-pharmacy server schema ready
- [ ] Test infrastructure set up (Vitest, Playwright)

---

## Release Strategy

| Release   | Audience              | Distribution                          |
|----------|-----------------------|---------------------------------------|
| MVP      | Internal / pilot pharmacy | Direct URL, manual PWA install     |
| V1       | 3–5 pharmacies (beta)    | Shared URL, guided onboarding       |
| V2       | General availability     | Published domain, app store listing (if Capacitor) |

---

## Success Metrics

| Metric                          | MVP Target   | V1 Target    | V2 Target    |
|--------------------------------|-------------|-------------|-------------|
| Daily sales processed          | 20+         | 50+          | 100+         |
| Offline uptime (no data loss)  | 99%         | 99.5%        | 99.9%        |
| Sync success rate              | 95%         | 98%          | 99.5%        |
| Average sale completion time   | < 30 sec    | < 20 sec     | < 15 sec     |
| User satisfaction (1–5)        | 3.5+        | 4.0+         | 4.5+         |
| Report generation time         | —           | < 3 sec      | < 2 sec      |
| Active pharmacies              | 1           | 5            | 20+          |
