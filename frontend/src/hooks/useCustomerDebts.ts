import { useState, useCallback } from "react";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";

export interface CustomerDebt {
  id: string;
  customer_id: string;
  sale_id: string | null;
  sale_number: string | null;
  amount: number;
  paid_amount: number;
  status: string;
  notes: string;
  created_at: string;
  items: Array<{ name: string; quantity: number; unit_price: number; total: number }>;
}

export function useCustomerDebts() {
  const { db } = useDatabase();
  const [debts, setDebts] = useState<CustomerDebt[]>([]);

  const loadDebts = useCallback((customerId: string) => {
    if (!db) return;
    const result = db.exec(`
      SELECT cd.id, cd.customer_id, cd.sale_id, s.sale_number, cd.amount, cd.paid_amount, cd.status, cd.notes, cd.created_at
      FROM customer_debts cd
      LEFT JOIN sales s ON s.id = cd.sale_id
      WHERE cd.customer_id = ?
      ORDER BY cd.created_at DESC
    `, [customerId]);

    if (result.length === 0) { setDebts([]); return; }

    const debtList: CustomerDebt[] = result[0].values.map((r) => {
      const saleId = r[2] as string | null;
      let items: CustomerDebt["items"] = [];
      if (saleId) {
        const itemsResult = db.exec(`
          SELECT p.name, si.quantity, si.unit_price, si.total_price
          FROM sale_items si
          LEFT JOIN products p ON p.id = si.product_id
          WHERE si.sale_id = ?
        `, [saleId]);
        if (itemsResult.length > 0) {
          items = itemsResult[0].values.map((ir) => ({
            name: ir[0] as string,
            quantity: ir[1] as number,
            unit_price: ir[2] as number,
            total: ir[3] as number,
          }));
        }
      }
      return {
        id: r[0] as string,
        customer_id: r[1] as string,
        sale_id: saleId,
        sale_number: r[3] as string | null,
        amount: r[4] as number,
        paid_amount: r[5] as number,
        status: r[6] as string,
        notes: (r[7] as string) || "",
        created_at: r[8] as string,
        items,
      };
    });
    setDebts(debtList);
  }, [db]);

  const payDebt = useCallback((debtId: string, amount: number) => {
    if (!db) return;
    const debtResult = db.exec("SELECT customer_id, amount, paid_amount FROM customer_debts WHERE id = ?", [debtId]);
    if (debtResult.length === 0) return;

    const customerId = debtResult[0].values[0][0] as string;
    const totalAmount = debtResult[0].values[0][1] as number;
    const currentPaid = debtResult[0].values[0][2] as number;
    const newPaid = currentPaid + amount;
    const newStatus = newPaid >= totalAmount ? "paid" : "partial";

    db.run("UPDATE customer_debts SET paid_amount = ?, status = ?, updated_at = datetime('now') WHERE id = ?", [newPaid, newStatus, debtId]);
    db.run("UPDATE customers SET credit_balance = credit_balance - ?, updated_at = datetime('now') WHERE id = ?", [amount, customerId]);
    saveDatabase(db);
    loadDebts(customerId);
  }, [db, loadDebts]);

  return { debts, loadDebts, payDebt };
}
