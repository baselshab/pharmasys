import { useCallback } from "react";
import { useDatabase } from "@/db/DatabaseProvider";

export interface InventoryAuditItem {
  product_id: string;
  product_name: string;
  category_name: string;
  branch_id: string | null;
  stock: number;
  cost_value: number;
  sell_value: number;
  batch_count: number;
  earliest_expiry: string | null;
}

export interface SalesAuditItem {
  date: string;
  sale_number: string;
  customer_name: string | null;
  payment_method: string;
  total_amount: number;
  cost_total: number;
  profit: number;
  branch_id: string | null;
}

export interface PurchaseAuditItem {
  date: string;
  order_number: string;
  supplier_name: string;
  status: string;
  total_amount: number;
}

export interface CustomerAuditItem {
  id: string;
  name: string;
  phone: string;
  total_debt: number;
  paid_amount: number;
  remaining: number;
  invoice_count: number;
}

export function useAuditReports() {
  const { db } = useDatabase();

  const getInventoryAudit = useCallback((filters: { branchId?: string; categoryId?: string; productSearch?: string; expiryFrom?: string; expiryTo?: string }): InventoryAuditItem[] => {
    if (!db) return [];
    let sql = `
      SELECT p.id, p.name, COALESCE(c.name, 'Uncategorized'), p.branch_id,
             COALESCE(SUM(b.quantity), 0) as stock,
             COALESCE(SUM(b.quantity * b.cost_price), 0) as cost_val,
             COALESCE(SUM(b.quantity), 0) * p.sell_price as sell_val,
             COUNT(b.id) as batches,
             MIN(CASE WHEN b.quantity > 0 THEN b.expiry_date END)
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_batches b ON b.product_id = p.id
      WHERE p.is_active = 1
    `;
    const params: any[] = [];
    if (filters.branchId && filters.branchId !== "all") { sql += ` AND p.branch_id = ?`; params.push(filters.branchId); }
    if (filters.categoryId && filters.categoryId !== "all") { sql += ` AND p.category_id = ?`; params.push(filters.categoryId); }
    if (filters.productSearch) { sql += ` AND (p.name LIKE ? OR p.generic_name LIKE ?)`; params.push(`%${filters.productSearch}%`, `%${filters.productSearch}%`); }
    sql += ` GROUP BY p.id`;
    if (filters.expiryFrom || filters.expiryTo) {
      sql += ` HAVING 1=1`;
      if (filters.expiryFrom) { sql += ` AND MIN(CASE WHEN b.quantity > 0 THEN b.expiry_date END) >= ?`; params.push(filters.expiryFrom); }
      if (filters.expiryTo) { sql += ` AND MIN(CASE WHEN b.quantity > 0 THEN b.expiry_date END) <= ?`; params.push(filters.expiryTo); }
    }
    sql += ` ORDER BY p.name`;

    try {
      const result = db.exec(sql, params);
      if (result.length === 0) return [];
      return result[0].values.map((r) => ({
        product_id: r[0] as string, product_name: r[1] as string, category_name: r[2] as string,
        branch_id: r[3] as string | null, stock: r[4] as number,
        cost_value: r[5] as number, sell_value: r[6] as number,
        batch_count: r[7] as number, earliest_expiry: r[8] as string | null,
      }));
    } catch { return []; }
  }, [db]);

  const getSalesAudit = useCallback((filters: { fromDate?: string; toDate?: string; branchId?: string; paymentMethod?: string }): SalesAuditItem[] => {
    if (!db) return [];
    let sql = `
      SELECT DATE(s.sale_date), s.sale_number, cu.name, s.payment_method, s.total_amount,
             COALESCE(SUM(si.quantity * COALESCE((SELECT b2.cost_price FROM product_batches b2 WHERE b2.id = si.batch_id), p.cost_price)), 0),
             s.total_amount - COALESCE(SUM(si.quantity * COALESCE((SELECT b2.cost_price FROM product_batches b2 WHERE b2.id = si.batch_id), p.cost_price)), 0),
             s.branch_id
      FROM sales s
      LEFT JOIN sale_items si ON si.sale_id = s.id
      LEFT JOIN products p ON p.id = si.product_id
      LEFT JOIN customers cu ON cu.id = s.customer_id
      WHERE s.status = 'completed'
    `;
    const params: any[] = [];
    if (filters.fromDate) { sql += ` AND DATE(s.sale_date) >= ?`; params.push(filters.fromDate); }
    if (filters.toDate) { sql += ` AND DATE(s.sale_date) <= ?`; params.push(filters.toDate); }
    if (filters.branchId && filters.branchId !== "all") { sql += ` AND s.branch_id = ?`; params.push(filters.branchId); }
    if (filters.paymentMethod && filters.paymentMethod !== "all") { sql += ` AND s.payment_method = ?`; params.push(filters.paymentMethod); }
    sql += ` GROUP BY s.id ORDER BY s.sale_date DESC`;

    try {
      const result = db.exec(sql, params);
      if (result.length === 0) return [];
      return result[0].values.map((r) => ({
        date: r[0] as string, sale_number: r[1] as string,
        customer_name: r[2] as string | null, payment_method: r[3] as string,
        total_amount: r[4] as number, cost_total: r[5] as number,
        profit: r[6] as number, branch_id: r[7] as string | null,
      }));
    } catch { return []; }
  }, [db]);

  const getPurchaseAudit = useCallback((filters: { fromDate?: string; toDate?: string }): PurchaseAuditItem[] => {
    if (!db) return [];
    let sql = `SELECT DATE(po.order_date), po.order_number, s.name, po.status, po.total_amount
               FROM purchase_orders po LEFT JOIN suppliers s ON s.id = po.supplier_id WHERE 1=1`;
    const params: any[] = [];
    if (filters.fromDate) { sql += ` AND DATE(po.order_date) >= ?`; params.push(filters.fromDate); }
    if (filters.toDate) { sql += ` AND DATE(po.order_date) <= ?`; params.push(filters.toDate); }
    sql += ` ORDER BY po.order_date DESC`;
    try {
      const result = db.exec(sql, params);
      if (result.length === 0) return [];
      return result[0].values.map((r) => ({
        date: r[0] as string, order_number: r[1] as string,
        supplier_name: r[2] as string, status: r[3] as string, total_amount: r[4] as number,
      }));
    } catch { return []; }
  }, [db]);

  const getCustomerAudit = useCallback((): CustomerAuditItem[] => {
    if (!db) return [];
    try {
      const result = db.exec(`
        SELECT c.id, c.name, COALESCE(c.phone, ''),
               COALESCE(SUM(cd.amount), 0), COALESCE(SUM(cd.paid_amount), 0),
               COALESCE(SUM(cd.amount - cd.paid_amount), 0), COUNT(cd.id)
        FROM customers c
        LEFT JOIN customer_debts cd ON cd.customer_id = c.id
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY COALESCE(SUM(cd.amount - cd.paid_amount), 0) DESC
      `);
      if (result.length === 0) return [];
      return result[0].values.map((r) => ({
        id: r[0] as string, name: r[1] as string, phone: r[2] as string,
        total_debt: r[3] as number, paid_amount: r[4] as number,
        remaining: r[5] as number, invoice_count: r[6] as number,
      }));
    } catch { return []; }
  }, [db]);

  return { getInventoryAudit, getSalesAudit, getPurchaseAudit, getCustomerAudit };
}
