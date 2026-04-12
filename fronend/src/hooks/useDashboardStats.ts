import { useState, useEffect } from "react";
import { useDatabase } from "@/db/DatabaseProvider";

export interface DashboardStats {
  todaySales: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  lowStockCount: number;
  expiringSoonCount: number;
  recentSales: RecentSale[];
  lowStockItems: LowStockItem[];
  expiringSoonItems: ExpiringItem[];
}

export interface RecentSale {
  id: string;
  sale_number: string;
  total_amount: number;
  payment_method: string;
  item_count: number;
  sale_date: string;
}

export interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  reorder_level: number;
}

export interface ExpiringItem {
  product_name: string;
  batch_number: string;
  quantity: number;
  expiry_date: string;
}

export function useDashboardStats() {
  const { db, isReady } = useDatabase();
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
    recentSales: [],
    lowStockItems: [],
    expiringSoonItems: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !isReady) return;
    setLoading(true);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const soon = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

      // Today's sales count & revenue
      const todayResult = db.exec(
        `SELECT COUNT(*), COALESCE(SUM(total_amount), 0) FROM sales WHERE date(sale_date) = ?`,
        [today]
      );
      const todaySales = todayResult[0]?.values[0]?.[0] as number ?? 0;
      const todayRevenue = todayResult[0]?.values[0]?.[1] as number ?? 0;

      // Yesterday's revenue for comparison
      const yResult = db.exec(
        `SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE date(sale_date) = ?`,
        [yesterday]
      );
      const yesterdayRevenue = yResult[0]?.values[0]?.[0] as number ?? 0;

      // Low stock
      const lowStockResult = db.exec(`
        SELECT p.id, p.name, COALESCE(SUM(b.quantity), 0) as stock, p.reorder_level
        FROM products p
        LEFT JOIN product_batches b ON b.product_id = p.id
        WHERE p.is_active = 1
        GROUP BY p.id
        HAVING stock <= p.reorder_level
        ORDER BY stock ASC
        LIMIT 10
      `);
      const lowStockItems: LowStockItem[] = lowStockResult[0]?.values.map((r) => ({
        id: r[0] as string,
        name: r[1] as string,
        stock: r[2] as number,
        reorder_level: r[3] as number,
      })) ?? [];

      // Expiring within 90 days
      const expiringResult = db.exec(`
        SELECT p.name, b.batch_number, b.quantity, b.expiry_date
        FROM product_batches b
        JOIN products p ON p.id = b.product_id
        WHERE b.expiry_date <= ? AND b.quantity > 0
        ORDER BY b.expiry_date ASC
        LIMIT 10
      `, [soon]);
      const expiringSoonItems: ExpiringItem[] = expiringResult[0]?.values.map((r) => ({
        product_name: r[0] as string,
        batch_number: r[1] as string,
        quantity: r[2] as number,
        expiry_date: r[3] as string,
      })) ?? [];

      // Recent sales
      const recentResult = db.exec(`
        SELECT s.id, s.sale_number, s.total_amount, s.payment_method, s.sale_date,
               COUNT(si.id) as item_count
        FROM sales s
        LEFT JOIN sale_items si ON si.sale_id = s.id
        GROUP BY s.id
        ORDER BY s.sale_date DESC
        LIMIT 10
      `);
      const recentSales: RecentSale[] = recentResult[0]?.values.map((r) => ({
        id: r[0] as string,
        sale_number: r[1] as string,
        total_amount: r[2] as number,
        payment_method: r[3] as string,
        sale_date: r[4] as string,
        item_count: r[5] as number,
      })) ?? [];

      setStats({
        todaySales,
        todayRevenue,
        yesterdayRevenue,
        lowStockCount: lowStockItems.length,
        expiringSoonCount: expiringSoonItems.length,
        recentSales,
        lowStockItems,
        expiringSoonItems,
      });
    } catch (e) {
      console.error("Dashboard stats error:", e);
    } finally {
      setLoading(false);
    }
  }, [db, isReady]);

  return { stats, loading };
}
