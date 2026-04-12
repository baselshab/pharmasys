/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useDatabase } from "@/db/DatabaseProvider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { Search, FileText, Download, Eye, ShoppingCart } from "lucide-react";

interface Sale {
  id: string;
  sale_number: string;
  customer_name: string | null;
  total_amount: number;
  payment_method: string;
  status: string;
  sale_date: string;
  item_count: number;
}

interface SaleItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

export default function Sales() {
  const { t, isRTL } = useLanguage();
  const { db, isReady } = useDatabase();
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [detailSale, setDetailSale] = useState<Sale | null>(null);
  const [detailItems, setDetailItems] = useState<SaleItem[]>([]);

  const load = useCallback(() => {
    if (!db || !isReady) return;
    try {
      const result = db.exec(`
        SELECT s.id, s.sale_number, c.name as customer_name, s.total_amount, s.payment_method, s.status, s.sale_date,
               COUNT(si.id) as item_count
        FROM sales s
        LEFT JOIN customers c ON c.id = s.customer_id
        LEFT JOIN sale_items si ON si.sale_id = s.id
        GROUP BY s.id
        ORDER BY s.sale_date DESC
      `);
      if (result.length > 0) {
        setSales(result[0].values.map((r) => ({
          id: r[0] as string, sale_number: r[1] as string, customer_name: r[2] as string | null,
          total_amount: r[3] as number, payment_method: r[4] as string, status: r[5] as string,
          sale_date: r[6] as string, item_count: r[7] as number,
        })));
      } else {
        setSales([]);
      }
    } catch (e) {
      console.error("Load sales:", e);
    }
  }, [db, isReady]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = sales;
    if (paymentFilter !== "all") list = list.filter((s) => s.payment_method === paymentFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.sale_number.toLowerCase().includes(q) || s.customer_name?.toLowerCase().includes(q));
    }
    return list;
  }, [sales, search, paymentFilter]);

  const viewDetail = (sale: Sale) => {
    if (!db) return;
    setDetailSale(sale);
    try {
      const result = db.exec(`
        SELECT p.name, si.quantity, si.unit_price, si.discount, si.total_price
        FROM sale_items si JOIN products p ON p.id = si.product_id
        WHERE si.sale_id = ?
      `, [sale.id]);
      if (result.length > 0) {
        setDetailItems(result[0].values.map((r) => ({
          product_name: r[0] as string, quantity: r[1] as number, unit_price: r[2] as number,
          discount: r[3] as number, total_price: r[4] as number,
        })));
      } else {
        setDetailItems([]);
      }
    } catch { setDetailItems([]); }
  };

  const totalRevenue = filtered.reduce((s, v) => s + v.total_amount, 0);

  const headers = [t("saleNumber"), t("customer"), t("total"), t("paymentMethod"), t("status"), t("date"), t("items")];
  const rows = filtered.map((s) => [s.sale_number, s.customer_name || "—", s.total_amount.toFixed(2), s.payment_method, s.status, new Date(s.sale_date).toLocaleDateString(), String(s.item_count)]);

  const paymentBadgeVariant = (m: string) => {
    switch (m) {
      case "cash": return "secondary" as const;
      case "card": return "outline" as const;
      case "credit": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <AppLayout title={t("sales")} subtitle={t("salesDesc")}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportToPDF(t("sales"), headers, rows, isRTL)}><FileText className="h-4 w-4 ltr:mr-1 rtl:ml-1" /> PDF</Button>
          <Button size="sm" variant="outline" onClick={() => exportToCSV(headers, rows, "sales_report")}><Download className="h-4 w-4 ltr:mr-1 rtl:ml-1" /> Excel</Button>
        </div>
      }>
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="card-pharma p-4">
            <p className="text-xs text-muted-foreground">{t("totalRevenue")}</p>
            <p className="text-xl font-bold text-foreground">₪{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="card-pharma p-4">
            <p className="text-xs text-muted-foreground">{t("transactions")}</p>
            <p className="text-xl font-bold text-foreground">{filtered.length}</p>
          </div>
          <div className="card-pharma p-4 hidden sm:block">
            <p className="text-xs text-muted-foreground">{t("avgTransaction")}</p>
            <p className="text-xl font-bold text-foreground">₪{filtered.length > 0 ? (totalRevenue / filtered.length).toFixed(2) : "0.00"}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)} className="ltr:pl-9 rtl:pr-9" />
          </div>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("paymentMethods")}</SelectItem>
              <SelectItem value="cash">{t("cash")}</SelectItem>
              <SelectItem value="card">{t("card")}</SelectItem>
              <SelectItem value="mobile">{t("mobile")}</SelectItem>
              <SelectItem value="credit">{t("credit")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-[40vh] card-pharma">
            <div className="text-center">
              <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">{t("noSalesYet")}</p>
            </div>
          </div>
        ) : (
          <div className="card-pharma overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t("saleNumber")}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t("customer")}</TableHead>
                  <TableHead className="text-xs text-end">{t("total")}</TableHead>
                  <TableHead className="text-xs">{t("paymentMethod")}</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">{t("date")}</TableHead>
                  <TableHead className="text-xs text-end">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm font-mono">{s.sale_number}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{s.customer_name || "—"}</TableCell>
                    <TableCell className="text-sm text-end font-medium">₪{s.total_amount.toFixed(2)}</TableCell>
                    <TableCell><Badge variant={paymentBadgeVariant(s.payment_method)} className="text-[10px]">{t(s.payment_method as any)}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{new Date(s.sale_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => viewDetail(s)}><Eye className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Sale Detail Dialog */}
      <Dialog open={!!detailSale} onOpenChange={() => setDetailSale(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("saleNumber")}{detailSale?.sale_number}</DialogTitle>
            <DialogDescription>{detailSale && new Date(detailSale.sale_date).toLocaleString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("paymentMethod")}</span>
              <Badge variant="outline">{detailSale && t(detailSale.payment_method as any)}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("customer")}</span>
              <span>{detailSale?.customer_name || "—"}</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t("product")}</TableHead>
                  <TableHead className="text-xs text-end">{t("qty")}</TableHead>
                  <TableHead className="text-xs text-end">{t("price")}</TableHead>
                  <TableHead className="text-xs text-end">{t("total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs">{item.product_name}</TableCell>
                    <TableCell className="text-xs text-end">{item.quantity}</TableCell>
                    <TableCell className="text-xs text-end">₪{item.unit_price.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-end font-medium">₪{item.total_price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>{t("total")}</span>
              <span>₪{detailSale?.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
