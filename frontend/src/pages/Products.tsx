/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { BatchViewDialog } from "@/components/products/BatchViewDialog";
import { ProductFilters, type ProductFilterValues } from "@/components/products/ProductFilters";
import { useProducts, type Product, type Batch } from "@/hooks/useProducts";
import { useDatabase } from "@/db/DatabaseProvider";
import { seedIfEmpty } from "@/db/seedData";
import { toast } from "@/hooks/use-toast";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { Plus, Search, Pencil, Trash2, Layers, ShieldCheck, AlertTriangle, Package } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

const Products = () => {
  const { db, isReady } = useDatabase();
  const { products, categories, saveProduct, deleteProduct, getBatches } = useProducts();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showInactive, setShowInactive] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [batchView, setBatchView] = useState<{ name: string; batches: Batch[] } | null>(null);
  const [advFilters, setAdvFilters] = useState<ProductFilterValues>({ dosageForm: "all", supplierId: "all", branchId: "all", expiryFrom: "", expiryTo: "" });
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    if (db && isReady) seedIfEmpty(db);
  }, [db, isReady]);

  // Get expiry dates for products (earliest batch expiry)
  const productExpiries = useMemo(() => {
    if (!db) return new Map<string, string>();
    const map = new Map<string, string>();
    try {
      const result = db.exec("SELECT product_id, MIN(expiry_date) as earliest FROM product_batches GROUP BY product_id");
      if (result.length > 0) {
        result[0].values.forEach((r) => map.set(r[0] as string, r[1] as string));
      }
    } catch { /* empty */ }
    return map;
  }, [db, products]);

  const filtered = useMemo(() => {
    let list = products;
    if (!showInactive) list = list.filter((p) => p.is_active);
    if (categoryFilter !== "all") list = list.filter((p) => p.category_id === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) || p.generic_name?.toLowerCase().includes(q) || p.barcode?.includes(q)
      );
    }
    // Advanced filters
    if (advFilters.dosageForm !== "all") list = list.filter((p) => p.dosage_form === advFilters.dosageForm);
    if (advFilters.supplierId !== "all") list = list.filter((p) => p.supplier_id === advFilters.supplierId);
    if (advFilters.branchId !== "all") list = list.filter((p) => (p as any).branch_id === advFilters.branchId);
    if (advFilters.expiryFrom || advFilters.expiryTo) {
      list = list.filter((p) => {
        const exp = productExpiries.get(p.id);
        if (!exp) return false;
        if (advFilters.expiryFrom && exp < advFilters.expiryFrom) return false;
        if (advFilters.expiryTo && exp > advFilters.expiryTo) return false;
        return true;
      });
    }
    return list;
  }, [products, search, categoryFilter, showInactive, advFilters, productExpiries]);

  const handleEdit = (p: Product) => { setEditProduct(p); setFormOpen(true); };
  const handleAdd = () => { setEditProduct(null); setFormOpen(true); };
  const handleSave = (data: Parameters<typeof saveProduct>[0], editId?: string) => {
    const ok = saveProduct(data, editId);
    if (ok) toast({ title: editId ? t("productUpdated") : t("productAdded") });
    return ok;
  };
  const handleDelete = () => {
    if (!deleteTarget) return;
    const ok = deleteProduct(deleteTarget.id);
    if (ok) toast({ title: t("productDeactivated"), description: deleteTarget.name });
    setDeleteTarget(null);
  };
  const handleViewBatches = (p: Product) => {
    const batches = getBatches(p.id);
    setBatchView({ name: p.name, batches });
  };

  const headers = [t("product"), t("scientificName"), t("dosageForm"), t("category"), t("price"), t("cost"), t("stock"), t("supplier")];
  const rows = filtered.map((p) => [p.name, p.generic_name || "", p.dosage_form, p.category_name, p.sell_price.toFixed(2), p.cost_price.toFixed(2), String(p.stock), p.supplier_name || ""]);

  const handleExportPDF = () => exportToPDF(t("products"), headers, rows, isRTL);
  const handleExportCSV = () => exportToCSV(headers, rows, "products_report");

  return (
    <AppLayout title={t("products")} subtitle={t("manageProductCatalog")}
      actions={<Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" /> {t("addProduct")}</Button>}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("searchProducts")} value={search} onChange={(e) => setSearch(e.target.value)} className="ltr:pl-9 rtl:pr-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={t("allCategories")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{filtered.length} {t("products").toLowerCase()}</span>
            <span>{filtered.filter((p) => p.stock <= p.reorder_level).length} {t("lowStock").toLowerCase()}</span>
          </div>
          <ProductFilters filters={advFilters} onFiltersChange={setAdvFilters} onExportPDF={handleExportPDF} onExportCSV={handleExportCSV} />
        </div>

        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-[40vh] card-pharma">
            <div className="text-center">
              <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">{t("noProductsFound")}</p>
            </div>
          </div>
        ) : (
          <div className="card-pharma overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t("product")}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t("dosageForm")}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t("category")}</TableHead>
                  <TableHead className="text-xs text-end">{t("price")}</TableHead>
                  <TableHead className="text-xs text-end">{t("stock")}</TableHead>
                  <TableHead className="text-xs text-end">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground">{p.name}</span>
                          {p.requires_prescription && <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
                        </div>
                        {p.generic_name && <p className="text-[11px] text-muted-foreground">{p.generic_name}</p>}
                        {p.barcode && <p className="text-[10px] text-muted-foreground font-mono">{p.barcode}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-[10px]">{p.dosage_form}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="text-[10px]">{p.category_name}</Badge>
                    </TableCell>
                    <TableCell className="text-end text-sm font-medium">₪{p.sell_price.toFixed(2)}</TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        {p.stock <= p.reorder_level && p.stock > 0 && <AlertTriangle className="h-3 w-3 text-warning" />}
                        <Badge variant={p.stock > p.reorder_level ? "secondary" : p.stock > 0 ? "outline" : "destructive"} className="text-[10px]">{p.stock}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewBatches(p)}><Layers className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(p)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editProduct} categories={categories} onSave={handleSave} />
      {batchView && <BatchViewDialog open={!!batchView} onOpenChange={() => setBatchView(null)} productName={batchView.name} batches={batchView.batches} />}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deactivateProduct")}</AlertDialogTitle>
            <AlertDialogDescription>"{deleteTarget?.name}" {t("deactivateDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("deactivate")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Products;
