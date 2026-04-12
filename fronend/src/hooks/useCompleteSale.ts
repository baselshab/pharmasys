import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";
import type { CartItem } from "./usePOSCart";
import { useCallback } from "react";

function generateId() {
  return crypto.randomUUID();
}

function generateSaleNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `SL-${date}-${rand}`;
}

export interface CompletedSale {
  id: string;
  saleNumber: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  date: string;
  customerId?: string;
  customerName?: string;
}

export function useCompleteSale() {
  const { db } = useDatabase();

  const completeSale = useCallback(
    (
      items: CartItem[],
      totals: { subtotal: number; discountTotal: number; total: number },
      paymentMethod: string,
      amountPaid: number,
      customerId?: string,
      debtNotes?: string
    ): CompletedSale | null => {
      if (!db || items.length === 0) return null;

      const saleId = generateId();
      const saleNumber = generateSaleNumber();
      const change = paymentMethod === "credit" ? 0 : Math.max(0, amountPaid - totals.total);
      const now = new Date().toISOString();

      try {
        db.run("BEGIN TRANSACTION");

        // Insert sale
        db.run(
          `INSERT INTO sales (id, pharmacy_id, customer_id, user_id, sale_number, status, subtotal, discount_amount, tax_amount, total_amount, payment_method, amount_paid, change_amount, sale_date)
           VALUES (?, 'ph-001', ?, 'user-001', ?, 'completed', ?, ?, 0, ?, ?, ?, ?, ?)`,
          [saleId, customerId || null, saleNumber, totals.subtotal, totals.discountTotal, totals.total, paymentMethod, amountPaid, change, now]
        );

        // Insert sale items & deduct stock (FEFO)
        for (const item of items) {
          const itemId = generateId();
          const lineTotal = item.product.sell_price * item.quantity - item.discount * item.quantity;

          db.run(
            `INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, discount, total_price)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [itemId, saleId, item.product.id, item.quantity, item.product.sell_price, item.discount, lineTotal]
          );

          // FEFO: deduct from earliest-expiring batches first
          let remaining = item.quantity;
          const batches = db.exec(
            `SELECT id, quantity FROM product_batches WHERE product_id = ? AND quantity > 0 ORDER BY expiry_date ASC`,
            [item.product.id]
          );

          if (batches.length > 0) {
            for (const row of batches[0].values) {
              if (remaining <= 0) break;
              const batchId = row[0] as string;
              const batchQty = row[1] as number;
              const deduct = Math.min(remaining, batchQty);
              db.run("UPDATE product_batches SET quantity = quantity - ?, updated_at = ? WHERE id = ?", [deduct, now, batchId]);
              if (remaining === item.quantity) {
                db.run("UPDATE sale_items SET batch_id = ? WHERE id = ?", [batchId, itemId]);
              }
              remaining -= deduct;
            }
          }

          db.run(
            `INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'sale_items', ?, 'INSERT', ?)`,
            [generateId(), itemId, JSON.stringify({ sale_id: saleId, product_id: item.product.id, quantity: item.quantity })]
          );
        }

        // Insert payment record
        db.run(
          `INSERT INTO sale_payments (id, sale_id, payment_method, amount) VALUES (?, ?, ?, ?)`,
          [generateId(), saleId, paymentMethod, amountPaid]
        );

        // Handle credit/debt payment
        if (paymentMethod === "credit" && customerId) {
          // Update customer credit balance
          db.run(
            "UPDATE customers SET credit_balance = credit_balance + ?, updated_at = ? WHERE id = ?",
            [totals.total, now, customerId]
          );

          // Insert debt record
          db.run(
            `INSERT INTO customer_debts (id, customer_id, sale_id, amount, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [generateId(), customerId, saleId, totals.total, debtNotes || "", now]
          );
        }

        // Sync log for sale
        db.run(
          `INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'sales', ?, 'INSERT', ?)`,
          [generateId(), saleId, JSON.stringify({ sale_number: saleNumber, total: totals.total, payment_method: paymentMethod })]
        );

        // Audit log
        try {
          db.run(`INSERT INTO audit_log (id, user_name, action, table_name, record_id, details, created_at) VALUES (?, 'System', 'SALE', 'sales', ?, ?, datetime('now'))`,
            [crypto.randomUUID(), saleId, `Sale ${saleNumber} — ${paymentMethod} — ILS ${totals.total.toFixed(2)}`]);
        } catch {}

        db.run("COMMIT");
        saveDatabase(db);

        // Get customer name if credit sale
        let customerName: string | undefined;
        if (customerId) {
          const cResult = db.exec("SELECT name FROM customers WHERE id = ?", [customerId]);
          if (cResult.length > 0) customerName = cResult[0].values[0][0] as string;
        }

        return {
          id: saleId,
          saleNumber,
          items,
          subtotal: totals.subtotal,
          discountTotal: totals.discountTotal,
          total: totals.total,
          paymentMethod,
          amountPaid,
          change,
          date: now,
          customerId,
          customerName,
        };
      } catch (e) {
        console.error("Sale failed:", e);
        try { db.run("ROLLBACK"); } catch {}
        return null;
      }
    },
    [db]
  );

  return { completeSale };
}
