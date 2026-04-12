import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  loyalty_points: number;
  credit_limit: number;
  credit_balance: number;
  is_active: number;
  created_at: string;
}

export function useCustomers() {
  const { db, isReady } = useDatabase();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!db || !isReady) return;
    try {
      const result = db.exec(
        "SELECT id, name, phone, email, address, loyalty_points, credit_limit, credit_balance, is_active, created_at FROM customers WHERE is_active = 1 ORDER BY name"
      );
      if (result.length > 0) {
        setCustomers(
          result[0].values.map((r) => ({
            id: r[0] as string,
            name: r[1] as string,
            phone: (r[2] as string) || "",
            email: (r[3] as string) || "",
            address: (r[4] as string) || "",
            loyalty_points: (r[5] as number) || 0,
            credit_limit: (r[6] as number) || 0,
            credit_balance: (r[7] as number) || 0,
            is_active: r[8] as number,
            created_at: r[9] as string,
          }))
        );
      } else {
        setCustomers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [db, isReady]);

  useEffect(() => { load(); }, [load]);

  const addCustomer = useCallback(
    (data: Pick<Customer, "name" | "phone" | "email" | "address" | "credit_limit">) => {
      if (!db) return;
      const id = crypto.randomUUID();
      db.run(
        "INSERT INTO customers (id, pharmacy_id, name, phone, email, address, credit_limit) VALUES (?, 'default', ?, ?, ?, ?, ?)",
        [id, data.name, data.phone, data.email, data.address, data.credit_limit]
      );
      db.run(
        "INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'customers', ?, 'INSERT', ?)",
        [crypto.randomUUID(), id, JSON.stringify(data)]
      );
      saveDatabase(db);
      load();
    },
    [db, load]
  );

  const updateCustomer = useCallback(
    (id: string, data: Pick<Customer, "name" | "phone" | "email" | "address" | "credit_limit">) => {
      if (!db) return;
      db.run(
        "UPDATE customers SET name=?, phone=?, email=?, address=?, credit_limit=?, updated_at=datetime('now') WHERE id=?",
        [data.name, data.phone, data.email, data.address, data.credit_limit, id]
      );
      db.run(
        "INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'customers', ?, 'UPDATE', ?)",
        [crypto.randomUUID(), id, JSON.stringify(data)]
      );
      saveDatabase(db);
      load();
    },
    [db, load]
  );

  const deleteCustomer = useCallback(
    (id: string) => {
      if (!db) return;
      db.run("UPDATE customers SET is_active=0, updated_at=datetime('now') WHERE id=?", [id]);
      db.run(
        "INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'customers', ?, 'UPDATE', ?)",
        [crypto.randomUUID(), id, JSON.stringify({ is_active: 0 })]
      );
      saveDatabase(db);
      load();
    },
    [db, load]
  );

  return { customers, loading, addCustomer, updateCustomer, deleteCustomer, reload: load };
}
