import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";

export interface Product {
  id: string;
  name: string;
  generic_name: string | null;
  barcode: string | null;
  unit: string;
  sell_price: number;
  cost_price: number;
  category_id: string | null;
  category_name: string;
  requires_prescription: boolean;
  reorder_level: number;
  is_active: boolean;
  stock: number;
  dosage_form: string;
  supplier_id: string | null;
  supplier_name: string | null;
}

export interface ProductFormData {
  name: string;
  generic_name: string;
  barcode: string;
  unit: string;
  sell_price: number;
  cost_price: number;
  category_id: string;
  requires_prescription: boolean;
  reorder_level: number;
  dosage_form: string;
  supplier_id: string;
}

export interface Batch {
  id: string;
  batch_number: string;
  quantity: number;
  cost_price: number;
  manufacture_date: string | null;
  expiry_date: string;
  received_date: string;
}

export function useProducts() {
  const { db, isReady } = useDatabase();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!db || !isReady) return;

    const catResult = db.exec("SELECT id, name FROM categories ORDER BY name");
    if (catResult.length > 0) {
      setCategories(catResult[0].values.map((r) => ({ id: r[0] as string, name: r[1] as string })));
    }

    const result = db.exec(`
      SELECT p.id, p.name, p.generic_name, p.barcode, p.unit, p.sell_price, p.cost_price,
             p.category_id, COALESCE(c.name, 'Uncategorized') as category_name,
             p.requires_prescription, p.reorder_level, p.is_active,
             COALESCE(SUM(b.quantity), 0) as stock,
             p.dosage_form, p.supplier_id, s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_batches b ON b.product_id = p.id
      LEFT JOIN suppliers s ON s.id = p.supplier_id
      GROUP BY p.id
      ORDER BY p.name
    `);
    if (result.length > 0) {
      setProducts(result[0].values.map((r) => ({
        id: r[0] as string,
        name: r[1] as string,
        generic_name: r[2] as string | null,
        barcode: r[3] as string | null,
        unit: r[4] as string,
        sell_price: r[5] as number,
        cost_price: r[6] as number,
        category_id: r[7] as string | null,
        category_name: r[8] as string,
        requires_prescription: (r[9] as number) === 1,
        reorder_level: r[10] as number,
        is_active: (r[11] as number) === 1,
        stock: r[12] as number,
        dosage_form: (r[13] as string) || "other",
        supplier_id: r[14] as string | null,
        supplier_name: r[15] as string | null,
      })));
    }
  }, [db, isReady, refreshKey]);

  const saveProduct = useCallback((data: ProductFormData, editId?: string) => {
    if (!db) return false;
    try {
      const now = new Date().toISOString();
      let recordId = editId || crypto.randomUUID();
      if (editId) {
        db.run(
          `UPDATE products SET name=?, generic_name=?, barcode=?, unit=?, sell_price=?, cost_price=?,
           category_id=?, requires_prescription=?, reorder_level=?, dosage_form=?, supplier_id=?, updated_at=? WHERE id=?`,
          [data.name, data.generic_name || null, data.barcode || null, data.unit, data.sell_price,
           data.cost_price, data.category_id || null, data.requires_prescription ? 1 : 0,
           data.reorder_level, data.dosage_form || "other", data.supplier_id || null, now, editId]
        );
        db.run(`INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'products', ?, 'UPDATE', ?)`,
          [crypto.randomUUID(), editId, JSON.stringify(data)]);
      } else {
        db.run(
          `INSERT INTO products (id, pharmacy_id, name, generic_name, barcode, unit, sell_price, cost_price,
           category_id, requires_prescription, reorder_level, dosage_form, supplier_id) VALUES (?, 'ph-001', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [recordId, data.name, data.generic_name || null, data.barcode || null, data.unit, data.sell_price,
           data.cost_price, data.category_id || null, data.requires_prescription ? 1 : 0, data.reorder_level,
           data.dosage_form || "other", data.supplier_id || null]
        );
        db.run(`INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'products', ?, 'INSERT', ?)`,
          [crypto.randomUUID(), recordId, JSON.stringify(data)]);
      }
      try { db.run(`INSERT INTO audit_log (id, user_name, action, table_name, record_id, details, created_at) VALUES (?, 'System', ?, 'products', ?, ?, datetime('now'))`,
        [crypto.randomUUID(), editId ? 'UPDATE' : 'CREATE', recordId, data.name]); } catch {}
      saveDatabase(db);
      refresh();
      return true;
    } catch (e) {
      console.error("Save product failed:", e);
      return false;
    }
  }, [db, refresh]);

  const deleteProduct = useCallback((id: string) => {
    if (!db) return false;
    try {
      db.run("UPDATE products SET is_active = 0, updated_at = ? WHERE id = ?", [new Date().toISOString(), id]);
      db.run(`INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'products', ?, 'DELETE', '{}')`,
        [crypto.randomUUID(), id]);
      saveDatabase(db);
      refresh();
      return true;
    } catch (e) {
      console.error("Delete product failed:", e);
      return false;
    }
  }, [db, refresh]);

  const getBatches = useCallback((productId: string): Batch[] => {
    if (!db) return [];
    const result = db.exec(
      `SELECT id, batch_number, quantity, cost_price, manufacture_date, expiry_date, received_date
       FROM product_batches WHERE product_id = ? ORDER BY expiry_date ASC`,
      [productId]
    );
    if (result.length === 0) return [];
    return result[0].values.map((r) => ({
      id: r[0] as string,
      batch_number: r[1] as string,
      quantity: r[2] as number,
      cost_price: r[3] as number,
      manufacture_date: r[4] as string | null,
      expiry_date: r[5] as string,
      received_date: r[6] as string,
    }));
  }, [db]);

  const addCategory = useCallback((name: string) => {
    if (!db) return null;
    const id = crypto.randomUUID();
    db.run("INSERT INTO categories (id, name) VALUES (?, ?)", [id, name]);
    saveDatabase(db);
    refresh();
    return id;
  }, [db, refresh]);

  return { products, categories, saveProduct, deleteProduct, getBatches, addCategory, refresh };
}
