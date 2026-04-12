import { useState, useEffect, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Shield, Users } from "lucide-react";
import { z } from "zod";

const employeeSchema = z.object({
  full_name: z.string().trim().min(1, "Employee name is required").max(200),
  email: z.string().email("Invalid email"),
  phone: z.string().max(20).optional().default(""),
});

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  branches: Array<{ assignment_id: string; branch_id: string; branch_name: string; role: string }>;
}

const ROLES = ["admin", "manager", "pharmacist", "cashier"] as const;

export default function Employees() {
  const { t } = useLanguage();
  const { db, isReady } = useDatabase();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [permOpen, setPermOpen] = useState<Employee | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [permBranch, setPermBranch] = useState("");
  const [permRole, setPermRole] = useState<string>("cashier");

  const load = useCallback(() => {
    if (!db || !isReady) return;
    try {
      const uResult = db.exec("SELECT id, full_name, email, phone, is_active, created_at FROM users ORDER BY full_name");
      const buResult = db.exec(`
        SELECT bu.id, bu.user_id, bu.branch_id, b.name as branch_name, bu.role
        FROM branch_users bu LEFT JOIN branches b ON b.id = bu.branch_id WHERE bu.is_active = 1
      `);
      const brResult = db.exec("SELECT id, name FROM branches WHERE is_active = 1 ORDER BY name");

      const branchMap = new Map<string, Array<{ assignment_id: string; branch_id: string; branch_name: string; role: string }>>();
      if (buResult.length > 0) {
        buResult[0].values.forEach((r) => {
          const userId = r[1] as string;
          if (!branchMap.has(userId)) branchMap.set(userId, []);
          branchMap.get(userId)!.push({
            assignment_id: r[0] as string,
            branch_id: r[2] as string,
            branch_name: (r[3] as string) || "",
            role: r[4] as string,
          });
        });
      }

      if (uResult.length > 0) {
        setEmployees(uResult[0].values.map((r) => ({
          id: r[0] as string,
          full_name: r[1] as string,
          email: (r[2] as string) || "",
          phone: (r[3] as string) || "",
          is_active: (r[4] as number) === 1,
          created_at: r[5] as string,
          branches: branchMap.get(r[0] as string) || [],
        })));
      } else {
        setEmployees([]);
      }
      if (brResult.length > 0) {
        setBranches(brResult[0].values.map((r) => ({ id: r[0] as string, name: r[1] as string })));
      }
    } catch (e) {
      console.error("Load employees:", e);
    }
  }, [db, isReady]);

  useEffect(() => { load(); }, [load]);

  const openForm = (emp?: Employee) => {
    if (emp) {
      setEditEmployee(emp);
      setFullName(emp.full_name);
      setEmail(emp.email);
      setPhone(emp.phone);
    } else {
      setEditEmployee(null);
      setFullName("");
      setEmail("");
      setPhone("");
    }
    setErrors({});
    setFormOpen(true);
  };

  const handleSave = () => {
    const result = employeeSchema.safeParse({ full_name: fullName, email, phone });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((e) => { errs[e.path[0] as string] = e.message; });
      setErrors(errs);
      return;
    }
    if (!db) return;
    try {
      if (editEmployee) {
        db.run("UPDATE users SET full_name=?, email=?, phone=?, updated_at=datetime('now') WHERE id=?",
          [fullName, email, phone || null, editEmployee.id]);
        toast.success(t("employeeUpdated"));
      } else {
        const id = crypto.randomUUID();
        db.run("INSERT INTO users (id, pharmacy_id, full_name, email, phone) VALUES (?, 'ph-001', ?, ?, ?)",
          [id, fullName, email, phone || null]);
        toast.success(t("employeeAdded"));
      }
      saveDatabase(db);
      setFormOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message?.includes("UNIQUE") ? t("emailAlreadyExists") : t("saleFailed"));
    }
  };

  const handleDelete = () => {
    if (!db || !deleteTarget) return;
    db.run("UPDATE users SET is_active=0, updated_at=datetime('now') WHERE id=?", [deleteTarget.id]);
    saveDatabase(db);
    toast.success(t("employeeDeleted"));
    setDeleteTarget(null);
    load();
  };

  const handleAssignBranch = () => {
    if (!db || !permOpen || !permBranch) return;
    const id = crypto.randomUUID();
    try {
      db.run("INSERT OR REPLACE INTO branch_users (id, branch_id, user_id, role) VALUES (?, ?, ?, ?)",
        [id, permBranch, permOpen.id, permRole]);
      saveDatabase(db);
      toast.success(t("roleAssigned"));
      load();
      const updated = employees.find((e) => e.id === permOpen.id);
      if (updated) setPermOpen({ ...updated });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    if (!db) return;
    db.run("DELETE FROM branch_users WHERE id=?", [assignmentId]);
    saveDatabase(db);
    toast.success(t("roleRemoved"));
    load();
  };

  const handleUpdateRole = (assignmentId: string, role: string) => {
    if (!db) return;
    db.run("UPDATE branch_users SET role=? WHERE id=?", [role, assignmentId]);
    saveDatabase(db);
    toast.success(t("roleUpdated"));
    load();
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return employees.filter((e) => e.is_active);
    const q = search.toLowerCase();
    return employees.filter((e) => e.is_active && (e.full_name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)));
  }, [employees, search]);

  const currentPermEmployee = permOpen ? employees.find((e) => e.id === permOpen.id) || permOpen : null;

  return (
    <AppLayout title={t("employees")} subtitle={t("manageEmployeesDesc")}
      actions={<Button size="sm" onClick={() => openForm()}><Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" /> {t("addEmployee")}</Button>}>
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("searchEmployees")} value={search} onChange={(e) => setSearch(e.target.value)} className="ltr:pl-9 rtl:pr-9" />
        </div>

        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-[40vh] card-pharma">
            <div className="text-center">
              <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">{t("noDataFound")}</p>
            </div>
          </div>
        ) : (
          <div className="card-pharma overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t("name")}</TableHead>
                  <TableHead className="text-xs">{t("email")}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t("phone")}</TableHead>
                  <TableHead className="text-xs">{t("branchAssignments")}</TableHead>
                  <TableHead className="text-xs text-end">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium text-sm">{emp.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{emp.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{emp.phone || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {emp.branches.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                        {emp.branches.map((b) => (
                          <Badge key={b.assignment_id} variant="outline" className="text-[10px]">
                            {b.branch_name} · {t(b.role as any)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPermOpen(emp)} title={t("rolesPermissions")}>
                          <Shield className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openForm(emp)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(emp)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editEmployee ? t("editEmployee") : t("addEmployee")}</DialogTitle>
            <DialogDescription>{editEmployee ? t("updateYourInfo") : t("addEmployeeDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("name")} *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t("email")} *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t("phone")}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleSave} className="gradient-primary text-primary-foreground">{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!permOpen} onOpenChange={() => setPermOpen(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("rolesPermissions")} — {currentPermEmployee?.full_name}</DialogTitle>
            <DialogDescription>{t("manageRolesDesc")}</DialogDescription>
          </DialogHeader>

          {currentPermEmployee && currentPermEmployee.branches.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">{t("branchAssignments")}</Label>
              {currentPermEmployee.branches.map((b) => (
                <div key={b.assignment_id} className="flex items-center justify-between p-2 rounded-md border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{b.branch_name}</Badge>
                    <Select value={b.role} onValueChange={(val) => handleUpdateRole(b.assignment_id, val)}>
                      <SelectTrigger className="h-7 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r}>{t(r as any)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-destructive text-xs" onClick={() => handleRemoveAssignment(b.assignment_id)}>
                    {t("delete")}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 pt-2 border-t">
            <Label className="text-xs font-semibold">{t("assignRole")}</Label>
            <div className="flex gap-2">
              <Select value={permBranch} onValueChange={setPermBranch}>
                <SelectTrigger className="flex-1"><SelectValue placeholder={t("selectBranch")} /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={permRole} onValueChange={setPermRole}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{t(r as any)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAssignBranch} disabled={!permBranch}>{t("assign")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteEmployee")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteEmployeeDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
