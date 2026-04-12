import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useDatabase } from "@/db/DatabaseProvider";
import { seedIfEmpty } from "@/db/seedData";
import { Search, Boxes, AlertTriangle, Clock, Package, TrendingDown } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface InventoryItem {
  id: string; name: string; category_name: string; unit: string;
  stock: number; reorder_level: number; sell_price: number;
  batch_count: number; earliest_expiry: string | null;
}

type FilterMode = "all" | "low_stock" | "out_of_stock" | "expiring";

const Inventory = () => {
  const { db, isReady } = useDatabase();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const { t } = useLanguage();

  useEffect(() => {
    if (!db || !isReady) return;
    seedIfEmpty(db);
    const result = db.exec(`
      SELECT p.id, p.name, COALESCE(c.name, 'Uncategorized'), p.unit,
             COALESCE(SUM(b.quantity), 0) as stock, p.reorder_level, p.sell_price,
             COUNT(b.id) as batch_count,
             MIN(CASE WHEN b.quantity > 0 THEN b.expiry_date END) as earliest_expiry
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_batches b ON b.product_id = p.id
      WHERE p.is_active = 1
      GROUP BY p.id
      ORDER BY p.name
    `);
    if (result.length > 0) {
      setItems(result[0].values.map((r) => ({
        id: r[0] as string, name: r[1] as string, category_name: r[2] as string,
        unit: r[3] as string, stock: r[4] as number, reorder_level: r[5] as number,
        sell_price: r[6] as number, batch_count: r[7] as number, earliest_expiry: r[8] as string | null,
      })));
    }
  }, [db, isReady]);

  const soon = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => ({
    total: items.length,
    lowStock: items.filter((i) => i.stock > 0 && i.stock <= i.reorder_level).length,
    outOfStock: items.filter((i) => i.stock === 0).length,
    expiring: items.filter((i) => i.earliest_expiry && i.earliest_expiry <= soon && i.earliest_expiry >= today).length,
    totalValue: items.reduce((s, i) => s + i.stock * i.sell_price, 0),
  }), [items, soon, today]);

  const filtered = useMemo(() => {
    let list = items;
    if (filter === "low_stock") list = list.filter((i) => i.stock > 0 && i.stock <= i.reorder_level);
    else if (filter === "out_of_stock") list = list.filter((i) => i.stock === 0);
    else if (filter === "expiring") list = list.filter((i) => i.earliest_expiry && i.earliest_expiry <= soon && i.earliest_expiry >= today);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [items, filter, search, soon, today]);

  const kpis = [
    { label: t("totalProducts"), value: stats.total, icon: Package, color: "text-primary", bg: "bg-primary/10" },
    { label: t("lowStock"), value: stats.lowStock, icon: TrendingDown, color: "text-warning", bg: "bg-warning/10" },
    { label: t("outOfStock"), value: stats.outOfStock, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: t("expiringSoon"), value: stats.expiring, icon: Clock, color: "text-info", bg: "bg-info/10" },
  ];

  return (
    <AppLayout title={t("inventoryPage")} subtitle={t("trackStockLevels")}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="kpi-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
                  <p className="text-xl font-bold text-foreground mt-1 font-display">{k.value}</p>
                </div>
                <div className={`h-8 w-8 rounded-lg ${k.bg} flex items-center justify-center`}>
                  <k.icon className={`h-4 w-4 ${k.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Card className="card-pharma">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("totalInventoryValue")}</span>
            <span className="text-lg font-bold text-foreground">₪{stats.totalValue.toFixed(2)}</span>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("searchInventory")} value={search} onChange={(e) => setSearch(e.target.value)} className="ltr:pl-9 rtl:pr-9" />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterMode)}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allItems")}</SelectItem>
              <SelectItem value="low_stock">{t("lowStock")}</SelectItem>
              <SelectItem value="out_of_stock">{t("outOfStock")}</SelectItem>
              <SelectItem value="expiring">{t("expiringSoon")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-[30vh] card-pharma">
            <div className="text-center">
              <Boxes className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">{t("noItemsMatch")}</p>
            </div>
          </div>
        ) : (
          <div className="card-pharma overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t("product")}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t("category")}</TableHead>
                  <TableHead className="text-xs text-end">{t("stock")}</TableHead>
                  <TableHead className="text-xs text-end hidden sm:table-cell">{t("reorder")}</TableHead>
                  <TableHead className="text-xs text-end hidden md:table-cell">{t("batches")}</TableHead>
                  <TableHead className="text-xs">{t("earliestExpiry")}</TableHead>
                  <TableHead className="text-xs text-end">{t("value")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => {
                  const isExpiring = item.earliest_expiry && item.earliest_expiry <= soon && item.earliest_expiry >= today;
                  const isExpired = item.earliest_expiry && item.earliest_expiry < today;
                  return (
                    <TableRow key={item.id}>
                      <TableCell><span className="text-sm font-medium text-foreground">{item.name}</span></TableCell>
                      <TableCell className="hidden md:table-cell"><Badge variant="secondary" className="text-[10px]">{item.category_name}</Badge></TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          {item.stock <= item.reorder_level && item.stock > 0 && <AlertTriangle className="h-3 w-3 text-warning" />}
                          <Badge variant={item.stock > item.reorder_level ? "secondary" : item.stock > 0 ? "outline" : "destructive"} className="text-[10px]">
                            {item.stock} {item.unit}s
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-end text-xs text-muted-foreground hidden sm:table-cell">{item.reorder_level}</TableCell>
                      <TableCell className="text-end text-xs hidden md:table-cell">{item.batch_count}</TableCell>
                      <TableCell>
                        {item.earliest_expiry ? (
                          <span className={`text-xs ${isExpired ? "text-destructive font-medium" : isExpiring ? "text-warning" : "text-muted-foreground"}`}>
                            {new Date(item.earliest_expiry).toLocaleDateString()}
                          </span>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-end text-xs font-medium">₪{(item.stock * item.sell_price).toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Inventory;
