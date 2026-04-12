import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useBranches, type Branch, type BranchFormData } from "@/hooks/useBranches";
import { useLanguage } from "@/i18n/LanguageProvider";
import { toast } from "@/hooks/use-toast";
import { Plus, Building2, MapPin, Phone, User, Pencil, Trash2, Package, Users } from "lucide-react";

const Branches = () => {
  const { branches, saveBranch, deleteBranch } = useBranches();
  const { t } = useLanguage();
  const [formOpen, setFormOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchFormData>({ name: "", address: "", phone: "", manager_name: "" });

  const openAdd = () => { setEditBranch(null); setForm({ name: "", address: "", phone: "", manager_name: "" }); setFormOpen(true); };
  const openEdit = (b: Branch) => { setEditBranch(b); setForm({ name: b.name, address: b.address, phone: b.phone, manager_name: b.manager_name }); setFormOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const ok = saveBranch(form, editBranch?.id);
    if (ok) {
      toast({ title: editBranch ? t("branchUpdated") : t("branchAdded") });
      setFormOpen(false);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteBranch(deleteTarget.id);
    toast({ title: t("branchDeleted"), description: deleteTarget.name });
    setDeleteTarget(null);
  };

  return (
    <AppLayout title={t("branches")} subtitle={t("manageBranches")}
      actions={<Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" /> {t("addBranch")}</Button>}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((b) => (
            <Card key={b.id} className="card-pharma">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{b.name}</CardTitle>
                      {b.address && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{b.address}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(b)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {b.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{b.phone}</span>}
                  {b.manager_name && <span className="flex items-center gap-1"><User className="h-3 w-3" />{b.manager_name}</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary" className="text-[10px]"><Package className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{b.product_count} {t("products")}</Badge>
                  <Badge variant="secondary" className="text-[10px]"><Users className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{b.user_count} {t("employees")}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {branches.length === 0 && (
            <div className="col-span-full flex items-center justify-center h-[40vh] card-pharma">
              <div className="text-center"><Building2 className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">{t("noBranchesFound")}</p></div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editBranch ? t("editBranch") : t("addBranch")}</DialogTitle>
            <DialogDescription>{editBranch ? t("editBranchDesc") : t("addBranchDesc")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label className="text-xs">{t("branchName")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1" /></div>
            <div><Label className="text-xs">{t("address")}</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">{t("phone")}</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">{t("managerName")}</Label><Input value={form.manager_name} onChange={(e) => setForm({ ...form, manager_name: e.target.value })} className="mt-1" /></div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setFormOpen(false)}>{t("cancel")}</Button>
              <Button type="submit" className="flex-1">{editBranch ? t("update") : t("addBranch")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteBranch")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteBranchDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Branches;
