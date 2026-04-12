import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoles, ROLES, type Role } from "@/hooks/useRoles";
import { useBranches } from "@/hooks/useBranches";
import { useDatabase } from "@/db/DatabaseProvider";
import { saveDatabase } from "@/db/sqlite";
import { useLanguage } from "@/i18n/LanguageProvider";
import { toast } from "@/hooks/use-toast";
import { Plus, Shield, Trash2, Building2, UserCog } from "lucide-react";

const RolesPermissions = () => {
  const { t } = useLanguage();
  const { db } = useDatabase();
  const { branchUsers, rolePermissions, assignUserToBranch, updateUserRole, removeUserFromBranch } = useRoles();
  const { branches } = useBranches();
  const [assignOpen, setAssignOpen] = useState(false);
  const [newAssign, setNewAssign] = useState({ name: "", email: "", branch_id: "", role: "cashier" as Role });

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !newAssign.name.trim() || !newAssign.branch_id) return;

    // Create or find user
    let userId: string;
    const existing = db.exec("SELECT id FROM users WHERE email = ?", [newAssign.email || `${newAssign.name.replace(/\s/g, '').toLowerCase()}@local`]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      userId = existing[0].values[0][0] as string;
    } else {
      userId = crypto.randomUUID();
      db.run("INSERT INTO users (id, pharmacy_id, full_name, email) VALUES (?, 'ph-001', ?, ?)",
        [userId, newAssign.name, newAssign.email || `${newAssign.name.replace(/\s/g, '').toLowerCase()}@local`]);
      saveDatabase(db);
    }

    const ok = assignUserToBranch(userId, newAssign.branch_id, newAssign.role);
    if (ok) {
      toast({ title: t("roleAssigned") });
      setAssignOpen(false);
      setNewAssign({ name: "", email: "", branch_id: "", role: "cashier" });
    }
  };

  const handleRemove = (id: string) => {
    removeUserFromBranch(id);
    toast({ title: t("roleRemoved") });
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "manager": return "default";
      case "pharmacist": return "secondary";
      default: return "outline";
    }
  };

  return (
    <AppLayout title={t("rolesPermissions")} subtitle={t("manageRolesDesc")}
      actions={<Button size="sm" onClick={() => setAssignOpen(true)}><Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" /> {t("assignRole")}</Button>}>
      <div className="space-y-6">
        {/* Role permissions overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES.map((role) => (
            <Card key={role} className="card-pharma">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm capitalize">{t(role as any)}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {(rolePermissions[role] || []).map((p) => (
                    <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Branch user assignments */}
        <Card className="card-pharma overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><UserCog className="h-4 w-4" /> {t("branchAssignments")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {branchUsers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <UserCog className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">{t("noAssignments")}</p>
                  <Button size="sm" className="mt-3" onClick={() => setAssignOpen(true)}>{t("assignRole")}</Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t("employee")}</TableHead>
                    <TableHead className="text-xs">{t("branch")}</TableHead>
                    <TableHead className="text-xs">{t("role")}</TableHead>
                    <TableHead className="text-xs text-end">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchUsers.map((bu) => (
                    <TableRow key={bu.id}>
                      <TableCell>
                        <div><p className="text-sm font-medium">{bu.user_name || "—"}</p><p className="text-[11px] text-muted-foreground">{bu.user_email}</p></div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]"><Building2 className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{bu.branch_name}</Badge></TableCell>
                      <TableCell>
                        <Select value={bu.role} onValueChange={(v) => { updateUserRole(bu.id, v as Role); toast({ title: t("roleUpdated") }); }}>
                          <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs capitalize">{t(r as any)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(bu.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("assignRole")}</DialogTitle>
            <DialogDescription>{t("assignRoleDesc")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4">
            <div><Label className="text-xs">{t("employeeName")} *</Label><Input value={newAssign.name} onChange={(e) => setNewAssign({ ...newAssign, name: e.target.value })} required className="mt-1" /></div>
            <div><Label className="text-xs">{t("email")}</Label><Input value={newAssign.email} onChange={(e) => setNewAssign({ ...newAssign, email: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t("branch")} *</Label>
                <Select value={newAssign.branch_id} onValueChange={(v) => setNewAssign({ ...newAssign, branch_id: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={t("selectBranch")} /></SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t("role")} *</Label>
                <Select value={newAssign.role} onValueChange={(v) => setNewAssign({ ...newAssign, role: v as Role })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{t(r as any)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setAssignOpen(false)}>{t("cancel")}</Button>
              <Button type="submit" className="flex-1">{t("assign")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default RolesPermissions;
