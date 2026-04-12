import { useState } from "react";
import { Plus, Building2, MapPin, Phone, Mail, Users, Search, MoreVertical } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useBranches, Branch, BranchFormData } from "@/hooks/useBranches";
import { toast } from "sonner";

const branchesData = [
  { id: "1", name: "الفرع الرئيسي", address: "شارع الجمهورية، صنعاء", city: "صنعاء", phone: "01-234567", email: "main@pharmaco.com", manager: "محمد أحمد", employees: 8, isActive: true, openTime: "08:00", closeTime: "22:00" },
  { id: "2", name: "فرع المدينة", address: "شارع تعز، المدينة", city: "تعز", phone: "04-567890", email: "city@pharmaco.com", manager: "عبدالله سعيد", employees: 5, isActive: true, openTime: "08:00", closeTime: "21:00" },
  { id: "3", name: "فرع الحي الجديد", address: "حي النهضة، عدن", city: "عدن", phone: "02-345678", email: "new@pharmaco.com", manager: "سارة حسن", employees: 4, isActive: false, openTime: "09:00", closeTime: "22:00" },
  // { id: "4", name: "فرع المطار", address: "طريق المطار، صنعاء", city: "صنعاء", phone: "01-987654", email: "airport@pharmaco.com", manager: "يوسف علي", employees: 3, isActive: false, openTime: "07:00", closeTime: "23:00" },
];

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
  const [search, setSearch] = useState("");
  const filtered = branchesData.filter((b) => b.name.includes(search) || b.city.includes(search));

  return (
    <AppLayout title={t("branches")} subtitle={t("manageBranches")}
          actions={<Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" /> {t("addBranch")}</Button>}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">إدارة الفروع</h1>
            <p className="text-muted-foreground">إدارة جميع فروع الصيدلية</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة فرع
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>إضافة فرع جديد</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>اسم الفرع</Label>
                  <Input placeholder="اسم الفرع" />
                </div>
                <div className="space-y-2">
                  <Label>المدينة</Label>
                  <Input placeholder="المدينة" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>العنوان</Label>
                  <Input placeholder="العنوان الكامل" />
                </div>
                <div className="space-y-2">
                  <Label>الهاتف</Label>
                  <Input placeholder="رقم الهاتف" />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input placeholder="البريد" />
                </div>
                <div className="space-y-2">
                  <Label>وقت الفتح</Label>
                  <Input type="time" defaultValue="08:00" />
                </div>
                <div className="space-y-2">
                  <Label>وقت الإغلاق</Label>
                  <Input type="time" defaultValue="22:00" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">إلغاء</Button>
                <Button>حفظ</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="بحث عن فرع..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((branch) => (
            <Card key={branch.id} className="stat-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{branch.name}</h3>
                      <p className="text-xs text-muted-foreground">{branch.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={branch.isActive ? "default" : "secondary"}>
                      {branch.isActive ? "نشط" : "معطل"}
                    </Badge>
                    <button className="p-1 rounded hover:bg-muted">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span>{branch.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span>{branch.employees} موظف — المدير: {branch.manager}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>أوقات العمل: {branch.openTime} - {branch.closeTime}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Branches;
