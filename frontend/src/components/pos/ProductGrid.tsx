import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, ShieldCheck } from "lucide-react";
import type { POSProduct } from "@/hooks/usePOSProducts";
import { useLanguage } from "@/i18n/LanguageProvider";

interface ProductGridProps {
  products: POSProduct[];
  categories: Array<{ id: string; name: string }>;
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  onAddToCart: (product: POSProduct) => void;
}

export function ProductGrid({
  products,
  categories,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  onAddToCart,
}: ProductGridProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchByName")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="ltr:pl-9 rtl:pr-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-auto flex-1">
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => onAddToCart(p)}
            disabled={p.stock <= 0}
            className="card-pharma p-3 text-start hover:shadow-pharma-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground truncate">{p.category_name}</span>
              {p.requires_prescription && (
                <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
            </div>
            <h3 className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
              {p.name}
            </h3>
            {p.generic_name && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{p.generic_name}</p>
            )}
            <div className="flex items-end justify-between mt-3">
              <span className="text-base font-bold text-foreground">₪{p.sell_price.toFixed(2)}</span>
              <div className="flex items-center gap-1">
                {p.stock <= 10 && p.stock > 0 && (
                  <AlertTriangle className="h-3 w-3 text-warning" />
                )}
                <Badge
                  variant={p.stock > 10 ? "secondary" : p.stock > 0 ? "outline" : "destructive"}
                  className="text-[10px] px-1.5"
                >
                  {p.stock} {p.unit}s
                </Badge>
              </div>
            </div>
          </button>
        ))}
        {products.length === 0 && (
          <div className="col-span-full flex items-center justify-center py-20 text-muted-foreground">
            {t("noProductsFound")}
          </div>
        )}
      </div>
    </div>
  );
}
