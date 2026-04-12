import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";

export interface AttendanceRecord {
  id: string;
  user_id: string;
  user_name: string;
  branch_id: string | null;
  branch_name: string | null;
  clock_in: string;
  clock_out: string | null;
  status: "present" | "late" | "absent";
  notes: string;
  duration_minutes: number | null;
}

export interface AttendanceSummary {
  user_id: string;
  user_name: string;
  total_days: number;
  present_days: number;
  late_days: number;
  absent_days: number;
  total_hours: number;
}

export function useAttendance() {
  const { db, isReady } = useDatabase();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [shiftStart, setShiftStart] = useState("09:00");
  const [lateThreshold, setLateThreshold] = useState(60); // minutes

  useEffect(() => {
    if (!db || !isReady) return;
    try {
      const meta = db.exec("SELECT key, value FROM sync_meta WHERE key IN ('setting_shift_start', 'setting_late_threshold')");
      if (meta.length > 0) {
        meta[0].values.forEach((r) => {
          if (r[0] === "setting_shift_start") setShiftStart(r[1] as string);
          if (r[0] === "setting_late_threshold") setLateThreshold(parseInt(r[1] as string) || 60);
        });
      }
    } catch {}
  }, [db, isReady]);

  const loadRecords = useCallback((filters?: { date?: string; month?: string; userId?: string }) => {
    if (!db) return;
    let sql = `SELECT a.id, a.user_id, COALESCE(u.full_name, 'Unknown'), a.branch_id, b.name,
               a.clock_in, a.clock_out, a.status, COALESCE(a.notes, ''),
               CASE WHEN a.clock_out IS NOT NULL THEN CAST((julianday(a.clock_out) - julianday(a.clock_in)) * 1440 AS INTEGER) ELSE NULL END
               FROM attendance a
               LEFT JOIN users u ON u.id = a.user_id
               LEFT JOIN branches b ON b.id = a.branch_id
               WHERE 1=1`;
    const params: any[] = [];
    if (filters?.date) { sql += ` AND DATE(a.clock_in) = ?`; params.push(filters.date); }
    if (filters?.month) { sql += ` AND strftime('%Y-%m', a.clock_in) = ?`; params.push(filters.month); }
    if (filters?.userId) { sql += ` AND a.user_id = ?`; params.push(filters.userId); }
    sql += ` ORDER BY a.clock_in DESC LIMIT 500`;

    try {
      const result = db.exec(sql, params);
      if (result.length > 0) {
        setRecords(result[0].values.map((r) => ({
          id: r[0] as string, user_id: r[1] as string, user_name: r[2] as string,
          branch_id: r[3] as string | null, branch_name: r[4] as string | null,
          clock_in: r[5] as string, clock_out: r[6] as string | null,
          status: r[7] as any, notes: r[8] as string,
          duration_minutes: r[9] as number | null,
        })));
      } else {
        setRecords([]);
      }
    } catch { setRecords([]); }
  }, [db]);

  const clockIn = useCallback((userId: string, branchId?: string) => {
    if (!db) return false;
    try {
      const today = new Date().toISOString().slice(0, 10);
      // Check if already clocked in today
      const existing = db.exec("SELECT id FROM attendance WHERE user_id = ? AND DATE(clock_in) = ?", [userId, today]);
      if (existing.length > 0 && existing[0].values.length > 0) return false;

      const now = new Date();
      const [shiftH, shiftM] = shiftStart.split(":").map(Number);
      const shiftTime = new Date(now);
      shiftTime.setHours(shiftH, shiftM, 0, 0);
      const diffMin = (now.getTime() - shiftTime.getTime()) / 60000;

      // Block if past threshold
      if (diffMin > lateThreshold) return false;

      const status = diffMin > 0 ? "late" : "present";
      const id = crypto.randomUUID();
      db.run(
        `INSERT INTO attendance (id, user_id, branch_id, clock_in, status) VALUES (?, ?, ?, ?, ?)`,
        [id, userId, branchId || null, now.toISOString(), status]
      );
      saveDatabase(db);
      return true;
    } catch (e) {
      console.error("Clock in failed:", e);
      return false;
    }
  }, [db, shiftStart, lateThreshold]);

  const clockOut = useCallback((attendanceId: string) => {
    if (!db) return false;
    try {
      db.run("UPDATE attendance SET clock_out = ? WHERE id = ?", [new Date().toISOString(), attendanceId]);
      saveDatabase(db);
      return true;
    } catch { return false; }
  }, [db]);

  const getMonthlySummary = useCallback((month: string): AttendanceSummary[] => {
    if (!db) return [];
    try {
      const result = db.exec(`
        SELECT a.user_id, COALESCE(u.full_name, 'Unknown'),
               COUNT(*) as total,
               SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END),
               SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END),
               SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END),
               COALESCE(SUM(CASE WHEN a.clock_out IS NOT NULL THEN (julianday(a.clock_out) - julianday(a.clock_in)) * 24 ELSE 0 END), 0)
        FROM attendance a
        LEFT JOIN users u ON u.id = a.user_id
        WHERE strftime('%Y-%m', a.clock_in) = ?
        GROUP BY a.user_id
      `, [month]);
      if (result.length === 0) return [];
      return result[0].values.map((r) => ({
        user_id: r[0] as string, user_name: r[1] as string,
        total_days: r[2] as number, present_days: r[3] as number,
        late_days: r[4] as number, absent_days: r[5] as number,
        total_hours: Math.round((r[6] as number) * 10) / 10,
      }));
    } catch { return []; }
  }, [db]);

  const getUsers = useCallback(() => {
    if (!db) return [];
    try {
      const result = db.exec("SELECT id, full_name FROM users WHERE is_active = 1 ORDER BY full_name");
      if (result.length === 0) return [];
      return result[0].values.map((r) => ({ id: r[0] as string, name: r[1] as string }));
    } catch { return []; }
  }, [db]);

  const saveSettings = useCallback((start: string, threshold: number) => {
    if (!db) return;
    db.run("INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES ('setting_shift_start', ?, datetime('now'))", [start]);
    db.run("INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES ('setting_late_threshold', ?, datetime('now'))", [String(threshold)]);
    saveDatabase(db);
    setShiftStart(start);
    setLateThreshold(threshold);
  }, [db]);

  return { records, loadRecords, clockIn, clockOut, getMonthlySummary, getUsers, shiftStart, lateThreshold, saveSettings };
}
