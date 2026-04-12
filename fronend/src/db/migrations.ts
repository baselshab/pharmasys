export const SCHEMA_VERSION = 4;

export const MIGRATIONS: Record<number, string> = {
  1: `
    -- Pharmacy
    CREATE TABLE IF NOT EXISTS pharmacy (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      license_no TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- User roles
    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'pharmacist', 'cashier', 'manager')),
      UNIQUE(user_id, role)
    );

    -- Categories
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Products
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT NOT NULL,
      category_id TEXT,
      name TEXT NOT NULL,
      generic_name TEXT,
      barcode TEXT,
      unit TEXT NOT NULL DEFAULT 'piece',
      sell_price REAL NOT NULL,
      cost_price REAL NOT NULL DEFAULT 0,
      reorder_level INTEGER NOT NULL DEFAULT 10,
      max_stock INTEGER DEFAULT 1000,
      is_active INTEGER NOT NULL DEFAULT 1,
      requires_prescription INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Product batches
    CREATE TABLE IF NOT EXISTS product_batches (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      batch_number TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      cost_price REAL NOT NULL,
      manufacture_date TEXT,
      expiry_date TEXT NOT NULL,
      received_date TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Stock adjustments
    CREATE TABLE IF NOT EXISTS stock_adjustments (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      batch_id TEXT,
      user_id TEXT NOT NULL,
      adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('increase', 'decrease', 'damage', 'expired', 'correction')),
      quantity INTEGER NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Suppliers
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT NOT NULL,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      payment_terms TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Purchase orders
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT NOT NULL,
      supplier_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      order_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'partial', 'received', 'cancelled')),
      total_amount REAL NOT NULL DEFAULT 0,
      notes TEXT,
      order_date TEXT NOT NULL DEFAULT (datetime('now')),
      expected_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Purchase order items
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id TEXT PRIMARY KEY,
      purchase_order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity_ordered INTEGER NOT NULL,
      quantity_received INTEGER NOT NULL DEFAULT 0,
      unit_cost REAL NOT NULL,
      total_cost REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Customers
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      credit_limit REAL NOT NULL DEFAULT 0,
      credit_balance REAL NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Sales
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT NOT NULL,
      customer_id TEXT,
      user_id TEXT NOT NULL,
      sale_number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'partial_refund', 'on_hold')),
      subtotal REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile', 'credit', 'split')),
      amount_paid REAL NOT NULL,
      change_amount REAL NOT NULL DEFAULT 0,
      notes TEXT,
      sale_date TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Sale items
    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      batch_id TEXT,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      total_price REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Sale payments
    CREATE TABLE IF NOT EXISTS sale_payments (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      amount REAL NOT NULL,
      reference TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Sync log
    CREATE TABLE IF NOT EXISTS sync_log (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
      payload TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at TEXT
    );

    -- Sync meta
    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_products_pharmacy ON products(pharmacy_id);
    CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
    CREATE INDEX IF NOT EXISTS idx_sales_pharmacy ON sales(pharmacy_id);
    CREATE INDEX IF NOT EXISTS idx_sync_log_unsynced ON sync_log(synced) WHERE synced = 0;
    CREATE INDEX IF NOT EXISTS idx_batches_expiry ON product_batches(expiry_date);
    CREATE INDEX IF NOT EXISTS idx_batches_product ON product_batches(product_id);

    -- Schema version tracking
    INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES ('schema_version', '1', datetime('now'));
  `,
  2: `
    -- Add dosage_form and supplier_id to products
    ALTER TABLE products ADD COLUMN dosage_form TEXT DEFAULT 'other';
    ALTER TABLE products ADD COLUMN supplier_id TEXT;

    -- Customer debts tracking table
    CREATE TABLE IF NOT EXISTS customer_debts (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      sale_id TEXT,
      amount REAL NOT NULL,
      paid_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid')),
      notes TEXT,
      due_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_customer_debts_customer ON customer_debts(customer_id);
    CREATE INDEX IF NOT EXISTS idx_customer_debts_status ON customer_debts(status);

    INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES ('schema_version', '2', datetime('now'));
  `,
  3: `
    -- Branches
    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT NOT NULL DEFAULT 'ph-001',
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      manager_name TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Branch user assignments with roles
    CREATE TABLE IF NOT EXISTS branch_users (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'pharmacist', 'cashier')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(branch_id, user_id)
    );

    -- Permissions per role
    CREATE TABLE IF NOT EXISTS role_permissions (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      permission TEXT NOT NULL,
      UNIQUE(role, permission)
    );

    -- Add branch_id to products and sales
    ALTER TABLE products ADD COLUMN branch_id TEXT;
    ALTER TABLE sales ADD COLUMN branch_id TEXT;

    -- Audit log
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      action TEXT NOT NULL,
      table_name TEXT,
      record_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Insert default branch
    INSERT OR IGNORE INTO branches (id, pharmacy_id, name, address) VALUES ('branch-main', 'ph-001', 'Main Branch', 'Main Location');

    -- Insert default role permissions
    INSERT OR IGNORE INTO role_permissions (id, role, permission) VALUES
      ('rp-01', 'admin', 'all'),
      ('rp-02', 'manager', 'pos'), ('rp-03', 'manager', 'products'), ('rp-04', 'manager', 'inventory'),
      ('rp-05', 'manager', 'purchases'), ('rp-06', 'manager', 'suppliers'), ('rp-07', 'manager', 'customers'),
      ('rp-08', 'manager', 'reports'), ('rp-09', 'manager', 'branches_view'),
      ('rp-10', 'pharmacist', 'pos'), ('rp-11', 'pharmacist', 'products'), ('rp-12', 'pharmacist', 'inventory'),
      ('rp-13', 'pharmacist', 'customers'),
      ('rp-14', 'cashier', 'pos'), ('rp-15', 'cashier', 'customers');

    CREATE INDEX IF NOT EXISTS idx_branch_users_branch ON branch_users(branch_id);
    CREATE INDEX IF NOT EXISTS idx_branch_users_user ON branch_users(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_log_date ON audit_log(created_at);
    CREATE INDEX IF NOT EXISTS idx_products_branch ON products(branch_id);
    CREATE INDEX IF NOT EXISTS idx_sales_branch ON sales(branch_id);

    INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES ('schema_version', '3', datetime('now'));
  `,
  4: `
    -- Attendance system
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      branch_id TEXT,
      clock_in TEXT NOT NULL,
      clock_out TEXT,
      status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(clock_in);

    -- Add supplier_id to product_batches
    ALTER TABLE product_batches ADD COLUMN supplier_id TEXT;

    -- Add branch_id to audit_log
    ALTER TABLE audit_log ADD COLUMN branch_id TEXT;

    -- Attendance settings
    INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES ('setting_shift_start', '09:00', datetime('now'));
    INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES ('setting_late_threshold', '60', datetime('now'));

    INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES ('schema_version', '4', datetime('now'));
  `,
};
