import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";

export interface PharmacySettings {
  name: string;
  address: string;
  phone: string;
  license_no: string;
  tax_rate: string;
  currency: string;
  receipt_header: string;
  receipt_footer: string;
}

const DEFAULTS: PharmacySettings = {
  name: "PharmaSYS",
  address: "",
  phone: "",
  license_no: "",
  tax_rate: "0",
  currency: "ILS",
  receipt_header: "",
  receipt_footer: "Thank you for your purchase!",
};

export function useSettings() {
  const { db, isReady } = useDatabase();
  const [settings, setSettings] = useState<PharmacySettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!db || !isReady) return;
    try {
      // Load from pharmacy table
      const pharma = db.exec("SELECT name, address, phone, license_no FROM pharmacy LIMIT 1");
      // Load from sync_meta key-value
      const meta = db.exec("SELECT key, value FROM sync_meta WHERE key LIKE 'setting_%'");

      const s = { ...DEFAULTS };
      if (pharma.length > 0 && pharma[0].values.length > 0) {
        const r = pharma[0].values[0];
        s.name = (r[0] as string) || DEFAULTS.name;
        s.address = (r[1] as string) || "";
        s.phone = (r[2] as string) || "";
        s.license_no = (r[3] as string) || "";
      }
      if (meta.length > 0) {
        for (const row of meta[0].values) {
          const key = (row[0] as string).replace("setting_", "");
          if (key in s) (s as any)[key] = row[1] as string;
        }
      }
      setSettings(s);
    } finally {
      setLoading(false);
    }
  }, [db, isReady]);

  useEffect(() => { load(); }, [load]);

  const saveSettings = useCallback(
    (data: PharmacySettings) => {
      if (!db) return;
      // Upsert pharmacy row
      const existing = db.exec("SELECT id FROM pharmacy LIMIT 1");
      if (existing.length > 0 && existing[0].values.length > 0) {
        db.run("UPDATE pharmacy SET name=?, address=?, phone=?, license_no=?, updated_at=datetime('now') WHERE id=?",
          [data.name, data.address, data.phone, data.license_no, existing[0].values[0][0]]);
      } else {
        db.run("INSERT INTO pharmacy (id, name, address, phone, license_no) VALUES (?, ?, ?, ?, ?)",
          [crypto.randomUUID(), data.name, data.address, data.phone, data.license_no]);
      }
      // Save extra settings in sync_meta
      for (const key of ["tax_rate", "currency", "receipt_header", "receipt_footer"] as const) {
        db.run("INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES (?, ?, datetime('now'))",
          [`setting_${key}`, data[key]]);
      }
      saveDatabase(db);
      setSettings(data);
    },
    [db]
  );

  const exportData = useCallback(() => {
    if (!db) return;
    const data = db.export();
    const blob = new Blob([data], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pharmasys-backup-${new Date().toISOString().split("T")[0]}.db`;
    a.click();
    URL.revokeObjectURL(url);
  }, [db]);

  const resetData = useCallback(() => {
    localStorage.removeItem("pharma_db");
    window.location.reload();
  }, []);

  return { settings, loading, saveSettings, exportData, resetData };
}
