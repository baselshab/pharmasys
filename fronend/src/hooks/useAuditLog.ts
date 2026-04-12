import { useState, useCallback } from "react";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";

export interface AuditEntry {
  id: string;
  user_name: string;
  action: string;
  table_name: string;
  record_id: string;
  details: string;
  branch_id: string | null;
  created_at: string;
}

export function useAuditLog() {
  const { db } = useDatabase();
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  const loadEntries = useCallback((filters?: { fromDate?: string; toDate?: string; action?: string; tableName?: string }) => {
    if (!db) return;
    let sql = `SELECT id, COALESCE(user_name, 'System'), action, COALESCE(table_name, ''), COALESCE(record_id, ''), COALESCE(details, ''), branch_id, created_at FROM audit_log WHERE 1=1`;
    const params: any[] = [];
    if (filters?.fromDate) { sql += ` AND DATE(created_at) >= ?`; params.push(filters.fromDate); }
    if (filters?.toDate) { sql += ` AND DATE(created_at) <= ?`; params.push(filters.toDate); }
    if (filters?.action) { sql += ` AND action = ?`; params.push(filters.action); }
    if (filters?.tableName) { sql += ` AND table_name = ?`; params.push(filters.tableName); }
    sql += ` ORDER BY created_at DESC LIMIT 500`;

    try {
      const result = db.exec(sql, params);
      if (result.length > 0) {
        setEntries(result[0].values.map((r) => ({
          id: r[0] as string, user_name: r[1] as string, action: r[2] as string,
          table_name: r[3] as string, record_id: r[4] as string, details: r[5] as string,
          branch_id: r[6] as string | null, created_at: r[7] as string,
        })));
      } else {
        setEntries([]);
      }
    } catch { setEntries([]); }
  }, [db]);

  return { entries, loadEntries };
}

/** Utility to log an audit entry — call from any hook */
export function logAudit(db: any, action: string, tableName: string, recordId: string, details: string, userName = "System") {
  if (!db) return;
  try {
    db.run(
      `INSERT INTO audit_log (id, user_name, action, table_name, record_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [crypto.randomUUID(), userName, action, tableName, recordId, details]
    );
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}
