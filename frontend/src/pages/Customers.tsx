import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useCustomers, type Customer } from "@/hooks/useCustomers";
import { CustomerDetailsDialog } from "@/components/customers/CustomerDetailsDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Users, Eye, CreditCard, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";

const emptyForm = { name: "", phone: "", email: "", address: "", credit_limit: 0 };

const Customers = () => {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null);
  const { t } = useLanguage();

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const totalCredit = customers.reduce((sum, c) => sum + c.credit_balance, 0);
  const debtors = customers.filter((c) => c.credit_balance > 0).length;

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, email: c.email, address: c.address, credit_limit: c.credit_limit });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error(t("customerNameRequired")); return; }
    if (editing) { updateCustomer(editing.id, form); toast.success(t("customerUpdated")); }
    else { addCustomer(form); toast.success(t("customerAdded")); }
    setDialogOpen(false);
  };

  const handleDelete = (c: Customer) => { deleteCustomer(c.id); toast.success(t("customerDeleted")); };

  return (
    <AppLayout title={t("customers")} subtitle={t("manageCustomerRecords")} actions={
      <Button size="sm" onClick={openAdd} className="gap-1.5">
        <Plus className="h-4 w-4" /> {t("addCustomer")}
      </Button>
    }>
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("searchCustomers")} value={search} onChange={(e) => setSearch(e.target.value)} className="ltr:pl-9 rtl:pr-9" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{customers.length}</p><p className="text-xs text-muted-foreground">{t("totalCustomers")}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><HandCoins className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-2xl font-bold text-destructive">ILS {totalCredit.toFixed(2)}</p><p className="text-xs text-muted-foreground">{t("totalDebts")}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><CreditCard className="h-5 w-5 text-warning" /></div>
            <div><p className="text-2xl font-bold text-foreground">{debtors}</p><p className="text-xs text-muted-foreground">{t("customersWithDebt")}</p></div>
          </CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("phone")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("email")}</TableHead>
                  <TableHead>{t("creditBalance")}</TableHead>
                  <TableHead>{t("creditLimit")}</TableHead>
                  <TableHead className="w-[130px]">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("loading")}</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("noCustomersFound")}</TableCell></TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer" onClick={() => setDetailsCustomer(c)}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.phone || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">{c.email || "—"}</TableCell>
                      <TableCell>
                        {c.credit_balance > 0
                          ? <Badge variant="destructive" className="text-[10px]">ILS {c.credit_balance.toFixed(2)}</Badge>
                          : <span className="text-muted-foreground text-sm">—</span>}
                      </TableCell>
                      <TableCell className="text-sm">ILS {c.credit_limit.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailsCustomer(c)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(c)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? t("editCustomer") : t("addCustomer")}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>{t("name")} *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>{t("phone")}</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("email")}</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>{t("creditLimit")} (ILS)</Label>
              <Input type="number" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: Number(e.target.value) })} />
            </div>
            <div className="grid gap-1.5">
              <Label>{t("address")}</Label>
              <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleSave}>{editing ? t("update") : t("add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Details */}
      <CustomerDetailsDialog
        open={!!detailsCustomer}
        onOpenChange={() => setDetailsCustomer(null)}
        customer={detailsCustomer}
      />
    </AppLayout>
  );
};

export default Customers;
