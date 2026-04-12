import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager_name: string;
  is_active: boolean;
  created_at: string;
  product_count: number;
  user_count: number;
}

export interface BranchFormData {
  name: string;
  address: string;
  phone: string;
  manager_name: string;
}

export function useBranches() {
  const { db, isReady } = useDatabase();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!db || !isReady) return;
    try {
      const result = db.exec(`
        SELECT b.id, b.name, b.address, b.phone, b.manager_name, b.is_active, b.created_at,
               (SELECT COUNT(*) FROM products p WHERE p.branch_id = b.id) as product_count,
               (SELECT COUNT(*) FROM branch_users bu WHERE bu.branch_id = b.id AND bu.is_active = 1) as user_count
        FROM branches b WHERE b.is_active = 1 ORDER BY b.created_at ASC
      `);
      if (result.length > 0) {
        setBranches(result[0].values.map((r) => ({
          id: r[0] as string, name: r[1] as string, address: (r[2] as string) || "",
          phone: (r[3] as string) || "", manager_name: (r[4] as string) || "",
          is_active: (r[5] as number) === 1, created_at: r[6] as string,
          product_count: r[7] as number, user_count: r[8] as number,
        })));
      } else {
        setBranches([]);
      }
    } catch (e) {
      console.error("Load branches failed:", e);
    }
  }, [db, isReady, refreshKey]);

  const saveBranch = useCallback((data: BranchFormData, editId?: string) => {
    if (!db) return false;
    try {
      if (editId) {
        db.run("UPDATE branches SET name=?, address=?, phone=?, manager_name=?, updated_at=datetime('now') WHERE id=?",
          [data.name, data.address, data.phone, data.manager_name, editId]);
      } else {
        const id = crypto.randomUUID();
        db.run("INSERT INTO branches (id, pharmacy_id, name, address, phone, manager_name) VALUES (?, 'ph-001', ?, ?, ?, ?)",
          [id, data.name, data.address, data.phone, data.manager_name]);
      }
      saveDatabase(db);
      refresh();
      return true;
    } catch (e) {
      console.error("Save branch failed:", e);
      return false;
    }
  }, [db, refresh]);

  const deleteBranch = useCallback((id: string) => {
    if (!db) return false;
    try {
      db.run("UPDATE branches SET is_active = 0, updated_at = datetime('now') WHERE id = ?", [id]);
      saveDatabase(db);
      refresh();
      return true;
    } catch (e) {
      console.error("Delete branch failed:", e);
      return false;
    }
  }, [db, refresh]);

  return { branches, saveBranch, deleteBranch, refresh };
}
