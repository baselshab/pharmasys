import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  supplier_name: string;
  order_number: string;
  status: string;
  total_amount: number;
  notes: string;
  order_date: string;
  expected_date: string;
  item_count: number;
}

export interface POItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
}

export function usePurchaseOrders() {
  const { db, isReady } = useDatabase();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!db || !isReady) return;
    try {
      const result = db.exec(`
        SELECT po.id, po.supplier_id, s.name as supplier_name, po.order_number, po.status, 
               po.total_amount, po.notes, po.order_date, po.expected_date,
               (SELECT COUNT(*) FROM purchase_order_items WHERE purchase_order_id = po.id) as item_count
        FROM purchase_orders po
        LEFT JOIN suppliers s ON s.id = po.supplier_id
        ORDER BY po.order_date DESC
      `);
      if (result.length > 0) {
        setOrders(
          result[0].values.map((r) => ({
            id: r[0] as string,
            supplier_id: r[1] as string,
            supplier_name: (r[2] as string) || "Unknown",
            order_number: r[3] as string,
            status: r[4] as string,
            total_amount: (r[5] as number) || 0,
            notes: (r[6] as string) || "",
            order_date: r[7] as string,
            expected_date: (r[8] as string) || "",
            item_count: (r[9] as number) || 0,
          }))
        );
      } else {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, [db, isReady]);

  useEffect(() => { load(); }, [load]);

  const getNextOrderNumber = useCallback(() => {
    if (!db) return "PO-0001";
    const result = db.exec("SELECT COUNT(*) FROM purchase_orders");
    const count = result.length > 0 ? (result[0].values[0][0] as number) : 0;
    return `PO-${String(count + 1).padStart(4, "0")}`;
  }, [db]);

  const createOrder = useCallback(
    (data: { supplier_id: string; notes: string; expected_date: string; items: { product_id: string; quantity: number; unit_cost: number }[] }) => {
      if (!db) return;
      const id = crypto.randomUUID();
      const orderNumber = getNextOrderNumber();
      const totalAmount = data.items.reduce((sum, i) => sum + i.quantity * i.unit_cost, 0);

      db.run("BEGIN");
      try {
        db.run(
          "INSERT INTO purchase_orders (id, pharmacy_id, supplier_id, user_id, order_number, status, total_amount, notes, expected_date) VALUES (?, 'default', ?, 'default', ?, 'draft', ?, ?, ?)",
          [id, data.supplier_id, orderNumber, totalAmount, data.notes, data.expected_date]
        );

        for (const item of data.items) {
          db.run(
            "INSERT INTO purchase_order_items (id, purchase_order_id, product_id, quantity_ordered, unit_cost, total_cost) VALUES (?, ?, ?, ?, ?, ?)",
            [crypto.randomUUID(), id, item.product_id, item.quantity, item.unit_cost, item.quantity * item.unit_cost]
          );
        }

        db.run(
          "INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'purchase_orders', ?, 'INSERT', ?)",
          [crypto.randomUUID(), id, JSON.stringify({ order_number: orderNumber, ...data })]
        );
        db.run("COMMIT");
      } catch (e) {
        db.run("ROLLBACK");
        throw e;
      }
      saveDatabase(db);
      load();
    },
    [db, load, getNextOrderNumber]
  );

  const getOrderItems = useCallback(
    (orderId: string): POItem[] => {
      if (!db) return [];
      const result = db.exec(
        `SELECT poi.id, poi.product_id, p.name, poi.quantity_ordered, poi.quantity_received, poi.unit_cost, poi.total_cost
         FROM purchase_order_items poi
         LEFT JOIN products p ON p.id = poi.product_id
         WHERE poi.purchase_order_id = ?`,
        [orderId]
      );
      if (result.length === 0) return [];
      return result[0].values.map((r) => ({
        id: r[0] as string,
        product_id: r[1] as string,
        product_name: (r[2] as string) || "Unknown",
        quantity_ordered: r[3] as number,
        quantity_received: r[4] as number,
        unit_cost: r[5] as number,
        total_cost: r[6] as number,
      }));
    },
    [db]
  );

  const receiveOrder = useCallback(
    (orderId: string, receivedItems: { item_id: string; product_id: string; quantity: number; batch_number: string; expiry_date: string; cost_price: number }[]) => {
      if (!db) return;
      db.run("BEGIN");
      try {
        for (const item of receivedItems) {
          // Create batch
          const batchId = crypto.randomUUID();
          db.run(
            "INSERT INTO product_batches (id, product_id, batch_number, quantity, cost_price, expiry_date) VALUES (?, ?, ?, ?, ?, ?)",
            [batchId, item.product_id, item.batch_number, item.quantity, item.cost_price, item.expiry_date]
          );
          // Update PO item received qty
          db.run(
            "UPDATE purchase_order_items SET quantity_received = quantity_received + ? WHERE id = ?",
            [item.quantity, item.item_id]
          );
        }
        // Update PO status
        const allReceived = db.exec(
          "SELECT COUNT(*) FROM purchase_order_items WHERE purchase_order_id = ? AND quantity_received < quantity_ordered",
          [orderId]
        );
        const pending = allReceived.length > 0 ? (allReceived[0].values[0][0] as number) : 0;
        const newStatus = pending === 0 ? "received" : "partial";
        db.run("UPDATE purchase_orders SET status = ?, updated_at = datetime('now') WHERE id = ?", [newStatus, orderId]);

        db.run(
          "INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'purchase_orders', ?, 'UPDATE', ?)",
          [crypto.randomUUID(), orderId, JSON.stringify({ status: newStatus, received: receivedItems.length })]
        );
        db.run("COMMIT");
      } catch (e) {
        db.run("ROLLBACK");
        throw e;
      }
      saveDatabase(db);
      load();
    },
    [db, load]
  );

  const updateStatus = useCallback(
    (orderId: string, status: string) => {
      if (!db) return;
      db.run("UPDATE purchase_orders SET status = ?, updated_at = datetime('now') WHERE id = ?", [status, orderId]);
      saveDatabase(db);
      load();
    },
    [db, load]
  );

  return { orders, loading, createOrder, getOrderItems, receiveOrder, updateStatus, reload: load };
}
