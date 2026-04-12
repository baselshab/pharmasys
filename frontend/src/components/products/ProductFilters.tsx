import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Filter, FileDown, FileSpreadsheet, X } from "lucide-react";
import { useBranches } from "@/hooks/useBranches";
import { useSuppliers } from "@/hooks/useSuppliers";

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
  { id: "other", labelEn: "Other", labelAr: "أخرى" },
];

export interface ProductFilterValues {
  dosageForm: string;
  supplierId: string;
  branchId: string;
  expiryFrom: string;
  expiryTo: string;
}

interface ProductFiltersProps {
  filters: ProductFilterValues;
  onFiltersChange: (filters: ProductFilterValues) => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
}

export function ProductFilters({ filters, onFiltersChange, onExportPDF, onExportCSV }: ProductFiltersProps) {
  const { t, locale } = useLanguage();
  const { branches } = useBranches();
  const { suppliers } = useSuppliers();

  const update = (key: keyof ProductFilterValues, value: string) =>
    onFiltersChange({ ...filters, [key]: value });

  const hasFilters = filters.dosageForm !== "all" || filters.supplierId !== "all" || filters.branchId !== "all" || filters.expiryFrom || filters.expiryTo;

  const clearFilters = () => onFiltersChange({ dosageForm: "all", supplierId: "all", branchId: "all", expiryFrom: "", expiryTo: "" });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            {t("advancedFilter")}
            {hasFilters && <Badge count={Object.values(filters).filter((v) => v && v !== "all").length} />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{t("advancedFilter")}</h4>
              {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs"><X className="h-3 w-3 ltr:mr-1 rtl:ml-1" />{t("clear")}</Button>}
            </div>

            <div>
              <Label className="text-xs">{t("dosageForm")}</Label>
              <Select value={filters.dosageForm} onValueChange={(v) => update("dosageForm", v)}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCategories")}</SelectItem>
                  {DOSAGE_FORMS.map((d) => <SelectItem key={d.id} value={d.id}>{locale === "ar" ? d.labelAr : d.labelEn}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">{t("supplier")}</Label>
              <Select value={filters.supplierId} onValueChange={(v) => update("supplierId", v)}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCategories")}</SelectItem>
                  {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">{t("branch")}</Label>
              <Select value={filters.branchId} onValueChange={(v) => update("branchId", v)}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allBranches")}</SelectItem>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">{t("expiryDateRange")}</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input type="date" value={filters.expiryFrom} onChange={(e) => update("expiryFrom", e.target.value)} className="h-8 text-xs" placeholder={t("from")} />
                <Input type="date" value={filters.expiryTo} onChange={(e) => update("expiryTo", e.target.value)} className="h-8 text-xs" placeholder={t("to")} />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="sm" onClick={onExportPDF} className="gap-1.5">
        <FileDown className="h-3.5 w-3.5" /> PDF
      </Button>
      <Button variant="outline" size="sm" onClick={onExportCSV} className="gap-1.5">
        <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
      </Button>
    </div>
  );
}

function Badge({ count }: { count: number }) {
  if (count === 0) return null;
  return <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">{count}</span>;
}
