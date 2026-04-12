import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  payment_terms: string;
  is_active: number;
  created_at: string;
}

export function useSuppliers() {
  const { db, isReady, save } = useDatabase();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!db || !isReady) return;
    try {
      const result = db.exec(
        "SELECT id, name, contact_person, phone, email, address, payment_terms, is_active, created_at FROM suppliers WHERE is_active = 1 ORDER BY name"
      );
      if (result.length > 0) {
        setSuppliers(
          result[0].values.map((r) => ({
            id: r[0] as string,
            name: r[1] as string,
            contact_person: (r[2] as string) || "",
            phone: (r[3] as string) || "",
            email: (r[4] as string) || "",
            address: (r[5] as string) || "",
            payment_terms: (r[6] as string) || "",
            is_active: r[7] as number,
            created_at: r[8] as string,
          }))
        );
      } else {
        setSuppliers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [db, isReady]);

  useEffect(() => { load(); }, [load]);

  const addSupplier = useCallback(
    (data: Omit<Supplier, "id" | "is_active" | "created_at">) => {
      if (!db) return;
      const id = crypto.randomUUID();
      db.run(
        "INSERT INTO suppliers (id, pharmacy_id, name, contact_person, phone, email, address, payment_terms) VALUES (?, 'default', ?, ?, ?, ?, ?, ?)",
        [id, data.name, data.contact_person, data.phone, data.email, data.address, data.payment_terms]
      );
      db.run(
        "INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'suppliers', ?, 'INSERT', ?)",
        [crypto.randomUUID(), id, JSON.stringify(data)]
      );
      saveDatabase(db);
      load();
    },
    [db, load]
  );

  const updateSupplier = useCallback(
    (id: string, data: Omit<Supplier, "id" | "is_active" | "created_at">) => {
      if (!db) return;
      db.run(
        "UPDATE suppliers SET name=?, contact_person=?, phone=?, email=?, address=?, payment_terms=?, updated_at=datetime('now') WHERE id=?",
        [data.name, data.contact_person, data.phone, data.email, data.address, data.payment_terms, id]
      );
      db.run(
        "INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'suppliers', ?, 'UPDATE', ?)",
        [crypto.randomUUID(), id, JSON.stringify(data)]
      );
      saveDatabase(db);
      load();
    },
    [db, load]
  );

  const deleteSupplier = useCallback(
    (id: string) => {
      if (!db) return;
      db.run("UPDATE suppliers SET is_active=0, updated_at=datetime('now') WHERE id=?", [id]);
      db.run(
        "INSERT INTO sync_log (id, table_name, record_id, operation, payload) VALUES (?, 'suppliers', ?, 'UPDATE', ?)",
        [crypto.randomUUID(), id, JSON.stringify({ is_active: 0 })]
      );
      saveDatabase(db);
      load();
    },
    [db, load]
  );

  return { suppliers, loading, addSupplier, updateSupplier, deleteSupplier, reload: load };
}
