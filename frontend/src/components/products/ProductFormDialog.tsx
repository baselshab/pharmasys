/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useSuppliers } from "@/hooks/useSuppliers";
import { productSchema } from "@/lib/validations/validationSchemas";
import type { Product, ProductFormData } from "@/hooks/useProducts";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Array<{ id: string; name: string }>;
  onSave: (data: ProductFormData, editId?: string) => boolean;
}

const UNITS = ["piece", "strip", "bottle", "box", "tube", "sachet", "vial", "tablet"];

const DOSAGE_FORMS = [
  { id: "tablet", labelEn: "Tablet", labelAr: "أقراص" },
  { id: "capsule", labelEn: "Capsule", labelAr: "كبسولة" },
  { id: "syrup", labelEn: "Syrup", labelAr: "شراب" },
  { id: "cream", labelEn: "Cream", labelAr: "كريم" },
  { id: "ointment", labelEn: "Ointment", labelAr: "مرهم" },
  { id: "gel", labelEn: "Gel", labelAr: "جل" },
  { id: "drops", labelEn: "Drops", labelAr: "قطرة" },
  { id: "injection", labelEn: "Injection", labelAr: "حقن" },
  { id: "powder", labelEn: "Powder", labelAr: "بودرة" },
  { id: "spray", labelEn: "Spray", labelAr: "بخاخ" },
  { id: "suppository", labelEn: "Suppository", labelAr: "تحاميل" },
  { id: "patch", labelEn: "Patch", labelAr: "لاصقة" },
  { id: "inhaler", labelEn: "Inhaler", labelAr: "بخاخ استنشاق" },
  { id: "solution", labelEn: "Solution", labelAr: "محلول" },
  { id: "suspension", labelEn: "Suspension", labelAr: "معلق" },
  { id: "other", labelEn: "Other", labelAr: "أخرى" },
];

export function ProductFormDialog({ open, onOpenChange, product, categories, onSave }: ProductFormDialogProps) {
  const { t, locale } = useLanguage();
  const { suppliers } = useSuppliers();

  const [form, setForm] = useState<ProductFormData>({
    name: "", generic_name: "", barcode: "", unit: "piece",
    sell_price: 0, cost_price: 0, category_id: "", requires_prescription: false, reorder_level: 10,
    dosage_form: "other", supplier_id: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        generic_name: product.generic_name || "",
        barcode: product.barcode || "",
        unit: product.unit,
        sell_price: product.sell_price,
        cost_price: product.cost_price,
        category_id: product.category_id || "",
        requires_prescription: product.requires_prescription,
        reorder_level: product.reorder_level,
        dosage_form: (product as any).dosage_form || "other",
        supplier_id: (product as any).supplier_id || "",
      });
    } else {
      setForm({ name: "", generic_name: "", barcode: "", unit: "piece", sell_price: 0, cost_price: 0, category_id: "", requires_prescription: false, reorder_level: 10, dosage_form: "other", supplier_id: "" });
    }
    setErrors({});
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = productSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const ok = onSave(form, product?.id);
    if (ok) onOpenChange(false);
  };

  const update = (key: keyof ProductFormData, value: string | number | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? t("edit") + " " + t("product") : t("addProduct")}</DialogTitle>
          <DialogDescription>{product ? t("editProductDesc") : t("addProductDesc")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">{t("tradeName")} *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} className={`mt-1 ${errors.name ? "border-destructive" : ""}`} />
              {errors.name && <p className="text-[11px] text-destructive mt-0.5">{errors.name}</p>}
            </div>
            <div className="col-span-2">
              <Label className="text-xs">{t("scientificName")}</Label>
              <Input value={form.generic_name} onChange={(e) => update("generic_name", e.target.value)} className="mt-1" placeholder={t("scientificNamePlaceholder")} />
            </div>
            <div>
              <Label className="text-xs">{t("dosageForm")}</Label>
              <Select value={form.dosage_form} onValueChange={(v) => update("dosage_form", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOSAGE_FORMS.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{locale === "ar" ? d.labelAr : d.labelEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("category")}</Label>
              <Select value={form.category_id} onValueChange={(v) => update("category_id", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t("selectCategory")} /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("barcode")}</Label>
              <Input value={form.barcode} onChange={(e) => update("barcode", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{t("supplier")}</Label>
              <Select value={form.supplier_id} onValueChange={(v) => update("supplier_id", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t("selectSupplier")} /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("unit")}</Label>
              <Select value={form.unit} onValueChange={(v) => update("unit", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t("reorderLevel")}</Label>
              <Input type="number" min={0} value={form.reorder_level} onChange={(e) => update("reorder_level", parseInt(e.target.value) || 0)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{t("sellPrice")} *</Label>
              <Input type="number" step="0.01" min={0} value={form.sell_price} onChange={(e) => update("sell_price", parseFloat(e.target.value) || 0)} className={`mt-1 ${errors.sell_price ? "border-destructive" : ""}`} />
              {errors.sell_price && <p className="text-[11px] text-destructive mt-0.5">{errors.sell_price}</p>}
            </div>
            <div>
              <Label className="text-xs">{t("costPrice")}</Label>
              <Input type="number" step="0.01" min={0} value={form.cost_price} onChange={(e) => update("cost_price", parseFloat(e.target.value) || 0)} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.requires_prescription} onCheckedChange={(v) => update("requires_prescription", v)} />
            <Label className="text-xs">{t("requiresPrescription")}</Label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
            <Button type="submit" className="flex-1">{product ? t("update") : t("addProduct")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
