import { useState, useEffect } from "react";
import { useDatabase } from "@/db/DatabaseProvider";

export interface AlertItem {
  id: string;
  type: "expiry" | "low_stock" | "out_of_stock";
  title: string;
  description: string;
  severity: "warning" | "danger" | "info";
}

export function useAlerts() {
  const { db, isReady } = useDatabase();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    if (!db || !isReady) return;
    const items: AlertItem[] = [];
    const today = new Date().toISOString().slice(0, 10);
    const soon = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

    try {
      // Expiry alerts
      const expiryResult = db.exec(`
        SELECT p.name, b.batch_number, b.expiry_date, b.quantity
        FROM product_batches b JOIN products p ON p.id = b.product_id
        WHERE b.expiry_date <= ? AND b.quantity > 0
        ORDER BY b.expiry_date ASC LIMIT 20
      `, [soon]);
      if (expiryResult.length > 0) {
        expiryResult[0].values.forEach((r) => {
          const expired = (r[2] as string) < today;
          items.push({
            id: `exp-${r[1]}`,
            type: "expiry",
            title: r[0] as string,
            description: `${r[1]} — ${expired ? "Expired" : "Expires"}: ${r[2]} (${r[3]} units)`,
            severity: expired ? "danger" : "warning",
          });
        });
      }

      // Low stock & out of stock
      const stockResult = db.exec(`
        SELECT p.id, p.name, COALESCE(SUM(b.quantity), 0) as stock, p.reorder_level
        FROM products p LEFT JOIN product_batches b ON b.product_id = p.id
        WHERE p.is_active = 1
        GROUP BY p.id HAVING stock <= p.reorder_level
        ORDER BY stock ASC LIMIT 20
      `);
      if (stockResult.length > 0) {
        stockResult[0].values.forEach((r) => {
          const stock = r[2] as number;
          items.push({
            id: `stock-${r[0]}`,
            type: stock === 0 ? "out_of_stock" : "low_stock",
            title: r[1] as string,
            description: stock === 0 ? "Out of stock" : `${stock} remaining (reorder: ${r[3]})`,
            severity: stock === 0 ? "danger" : "warning",
          });
        });
      }
    } catch (e) {
      console.error("Alerts error:", e);
    }

    setAlerts(items);
  }, [db, isReady]);

  return { alerts, expiryCount: alerts.filter(a => a.type === "expiry").length, lowStockCount: alerts.filter(a => a.type === "low_stock").length, outOfStockCount: alerts.filter(a => a.type === "out_of_stock").length };
}
