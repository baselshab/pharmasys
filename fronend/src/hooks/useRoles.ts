import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";

export interface BranchUser {
  id: string;
  branch_id: string;
  branch_name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role: string;
  is_active: boolean;
}

export const ROLES = ["admin", "manager", "pharmacist", "cashier"] as const;
export type Role = typeof ROLES[number];

export const PERMISSIONS = [
  "all", "pos", "products", "inventory", "purchases", "suppliers",
  "customers", "reports", "settings", "branches_view", "branches_manage",
  "roles_manage", "attendance",
] as const;

export function useRoles() {
  const { db, isReady } = useDatabase();
  const [branchUsers, setBranchUsers] = useState<BranchUser[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!db || !isReady) return;
    try {
      const buResult = db.exec(`
        SELECT bu.id, bu.branch_id, b.name as branch_name, bu.user_id,
               u.full_name as user_name, u.email as user_email, bu.role, bu.is_active
        FROM branch_users bu
        LEFT JOIN branches b ON b.id = bu.branch_id
        LEFT JOIN users u ON u.id = bu.user_id
        ORDER BY b.name, u.full_name
      `);
      if (buResult.length > 0) {
        setBranchUsers(buResult[0].values.map((r) => ({
          id: r[0] as string, branch_id: r[1] as string, branch_name: (r[2] as string) || "",
          user_id: r[3] as string, user_name: (r[4] as string) || "", user_email: (r[5] as string) || "",
          role: r[6] as string, is_active: (r[7] as number) === 1,
        })));
      }

      const rpResult = db.exec("SELECT role, permission FROM role_permissions");
      if (rpResult.length > 0) {
        const perms: Record<string, string[]> = {};
        rpResult[0].values.forEach((r) => {
          const role = r[0] as string;
          if (!perms[role]) perms[role] = [];
          perms[role].push(r[1] as string);
        });
        setRolePermissions(perms);
      }
    } catch (e) {
      console.error("Load roles failed:", e);
    }
  }, [db, isReady, refreshKey]);

  const assignUserToBranch = useCallback((userId: string, branchId: string, role: Role) => {
    if (!db) return false;
    try {
      const id = crypto.randomUUID();
      db.run(`INSERT OR REPLACE INTO branch_users (id, branch_id, user_id, role) VALUES (?, ?, ?, ?)`,
        [id, branchId, userId, role]);
      saveDatabase(db);
      refresh();
      return true;
    } catch (e) {
      console.error("Assign user failed:", e);
      return false;
    }
  }, [db, refresh]);

  const updateUserRole = useCallback((assignmentId: string, role: Role) => {
    if (!db) return false;
    try {
      db.run("UPDATE branch_users SET role = ? WHERE id = ?", [role, assignmentId]);
      saveDatabase(db);
      refresh();
      return true;
    } catch (e) {
      return false;
    }
  }, [db, refresh]);

  const removeUserFromBranch = useCallback((assignmentId: string) => {
    if (!db) return false;
    try {
      db.run("DELETE FROM branch_users WHERE id = ?", [assignmentId]);
      saveDatabase(db);
      refresh();
      return true;
    } catch (e) {
      return false;
    }
  }, [db, refresh]);

  const hasPermission = useCallback((role: string, permission: string) => {
    const perms = rolePermissions[role] || [];
    return perms.includes("all") || perms.includes(permission);
  }, [rolePermissions]);

  return { branchUsers, rolePermissions, assignUserToBranch, updateUserRole, removeUserFromBranch, hasPermission, refresh };
}
