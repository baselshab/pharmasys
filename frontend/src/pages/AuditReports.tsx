import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuditReports } from "@/hooks/useAuditReports";
import { useBranches } from "@/hooks/useBranches";
import { useProducts } from "@/hooks/useProducts";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { FileDown, FileSpreadsheet, Search, Package, DollarSign, Users, ShoppingCart } from "lucide-react";

const AuditReports = () => {
  const { t, isRTL } = useLanguage();
  const { getInventoryAudit, getSalesAudit, getPurchaseAudit, getCustomerAudit } = useAuditReports();
  const { branches } = useBranches();
  const { categories } = useProducts();

  // Filters
  const [invFilters, setInvFilters] = useState({ branchId: "all", categoryId: "all", productSearch: "", expiryFrom: "", expiryTo: "" });
  const [finFilters, setFinFilters] = useState({ fromDate: "", toDate: "", branchId: "all", paymentMethod: "all" });

  const inventoryData = useMemo(() => getInventoryAudit(invFilters), [getInventoryAudit, invFilters]);
  const salesData = useMemo(() => getSalesAudit(finFilters), [getSalesAudit, finFilters]);
  const purchaseData = useMemo(() => getPurchaseAudit({ fromDate: finFilters.fromDate, toDate: finFilters.toDate }), [getPurchaseAudit, finFilters.fromDate, finFilters.toDate]);
  const customerData = useMemo(() => getCustomerAudit(), [getCustomerAudit]);

  const invTotals = useMemo(() => ({
    items: inventoryData.length,
    totalStock: inventoryData.reduce((s, i) => s + i.stock, 0),
    costValue: inventoryData.reduce((s, i) => s + i.cost_value, 0),
    sellValue: inventoryData.reduce((s, i) => s + i.sell_value, 0),
  }), [inventoryData]);

  const salesTotals = useMemo(() => ({
    count: salesData.length,
    revenue: salesData.reduce((s, i) => s + i.total_amount, 0),
    cost: salesData.reduce((s, i) => s + i.cost_total, 0),
    profit: salesData.reduce((s, i) => s + i.profit, 0),
  }), [salesData]);

  const exportInvPDF = () => {
    const headers = [t("product"), t("category"), t("stock"), t("costPrice"), t("sellPrice"), t("expiryDate")];
    const rows = inventoryData.map((i) => [i.product_name, i.category_name, String(i.stock), i.cost_value.toFixed(2), i.sell_value.toFixed(2), i.earliest_expiry || "—"]);
    rows.push(["", t("total"), String(invTotals.totalStock), invTotals.costValue.toFixed(2), invTotals.sellValue.toFixed(2), ""]);
    exportToPDF(t("inventoryAudit"), headers, rows, isRTL);
  };

  const exportInvCSV = () => {
    const headers = [t("product"), t("category"), t("stock"), t("costPrice"), t("sellPrice"), t("expiryDate")];
    const rows = inventoryData.map((i) => [i.product_name, i.category_name, String(i.stock), i.cost_value.toFixed(2), i.sell_value.toFixed(2), i.earliest_expiry || ""]);
    exportToCSV(headers, rows, "inventory_audit");
  };

  const exportSalesPDF = () => {
    const headers = [t("date"), t("saleNumber"), t("customer"), t("paymentMethod"), t("total"), t("cost"), t("profit")];
    const rows = salesData.map((s) => [s.date, s.sale_number, s.customer_name || "—", s.payment_method, s.total_amount.toFixed(2), s.cost_total.toFixed(2), s.profit.toFixed(2)]);
    rows.push(["", "", "", t("total"), salesTotals.revenue.toFixed(2), salesTotals.cost.toFixed(2), salesTotals.profit.toFixed(2)]);
    exportToPDF(t("salesAudit"), headers, rows, isRTL);
  };

  const exportSalesCSV = () => {
    const headers = [t("date"), t("saleNumber"), t("customer"), t("paymentMethod"), t("total"), t("cost"), t("profit")];
    const rows = salesData.map((s) => [s.date, s.sale_number, s.customer_name || "", s.payment_method, s.total_amount.toFixed(2), s.cost_total.toFixed(2), s.profit.toFixed(2)]);
    exportToCSV(headers, rows, "sales_audit");
  };

  const exportCustPDF = () => {
    const headers = [t("name"), t("phone"), t("totalDebt"), t("paid"), t("remaining"), t("totalInvoices")];
    const rows = customerData.map((c) => [c.name, c.phone, c.total_debt.toFixed(2), c.paid_amount.toFixed(2), c.remaining.toFixed(2), String(c.invoice_count)]);
    exportToPDF(t("customerAudit"), headers, rows, isRTL);
  };

  const exportCustCSV = () => {
    const headers = [t("name"), t("phone"), t("totalDebt"), t("paid"), t("remaining"), t("totalInvoices")];
    const rows = customerData.map((c) => [c.name, c.phone, c.total_debt.toFixed(2), c.paid_amount.toFixed(2), c.remaining.toFixed(2), String(c.invoice_count)]);
    exportToCSV(headers, rows, "customer_audit");
  };

  return (
    <AppLayout title={t("auditReports")} subtitle={t("auditReportsDesc")}>
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory" className="gap-1"><Package className="h-3.5 w-3.5" /> {t("inventoryAudit")}</TabsTrigger>
          <TabsTrigger value="financial" className="gap-1"><DollarSign className="h-3.5 w-3.5" /> {t("financialAudit")}</TabsTrigger>
          <TabsTrigger value="customers" className="gap-1"><Users className="h-3.5 w-3.5" /> {t("customerAudit")}</TabsTrigger>
        </TabsList>

        {/* INVENTORY AUDIT */}
        <TabsContent value="inventory" className="space-y-4">
          <Card><CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div><Label className="text-xs">{t("search")}</Label>
                <Input value={invFilters.productSearch} onChange={(e) => setInvFilters({ ...invFilters, productSearch: e.target.value })} className="mt-1 h-8 text-xs" placeholder={t("searchProducts")} /></div>
              <div><Label className="text-xs">{t("branch")}</Label>
                <Select value={invFilters.branchId} onValueChange={(v) => setInvFilters({ ...invFilters, branchId: v })}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">{t("allBranches")}</SelectItem>
                    {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent></Select></div>
              <div><Label className="text-xs">{t("category")}</Label>
                <Select value={invFilters.categoryId} onValueChange={(v) => setInvFilters({ ...invFilters, categoryId: v })}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">{t("allCategories")}</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent></Select></div>
              <div><Label className="text-xs">{t("from")}</Label><Input type="date" value={invFilters.expiryFrom} onChange={(e) => setInvFilters({ ...invFilters, expiryFrom: e.target.value })} className="mt-1 h-8 text-xs" /></div>
              <div><Label className="text-xs">{t("to")}</Label><Input type="date" value={invFilters.expiryTo} onChange={(e) => setInvFilters({ ...invFilters, expiryTo: e.target.value })} className="mt-1 h-8 text-xs" /></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportInvPDF} className="gap-1"><FileDown className="h-3.5 w-3.5" /> PDF</Button>
              <Button variant="outline" size="sm" onClick={exportInvCSV} className="gap-1"><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</Button>
            </div>
          </CardContent></Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">{t("totalProducts")}</p><p className="text-xl font-bold">{invTotals.items}</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">{t("totalStock")}</p><p className="text-xl font-bold">{invTotals.totalStock}</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">{t("costValue")}</p><p className="text-xl font-bold">ILS {invTotals.costValue.toFixed(0)}</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">{t("sellValue")}</p><p className="text-xl font-bold">ILS {invTotals.sellValue.toFixed(0)}</p></CardContent></Card>
          </div>

          <Card className="card-pharma overflow-hidden"><Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">{t("product")}</TableHead>
              <TableHead className="text-xs">{t("category")}</TableHead>
              <TableHead className="text-xs text-end">{t("stock")}</TableHead>
              <TableHead className="text-xs text-end">{t("costValue")}</TableHead>
              <TableHead className="text-xs text-end">{t("sellValue")}</TableHead>
              <TableHead className="text-xs">{t("expiryDate")}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {inventoryData.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("noDataFound")}</TableCell></TableRow>
              ) : inventoryData.map((i) => (
                <TableRow key={i.product_id}>
                  <TableCell className="text-sm font-medium">{i.product_name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{i.category_name}</Badge></TableCell>
                  <TableCell className="text-end">{i.stock}</TableCell>
                  <TableCell className="text-end text-xs">ILS {i.cost_value.toFixed(2)}</TableCell>
                  <TableCell className="text-end text-xs">ILS {i.sell_value.toFixed(2)}</TableCell>
                  <TableCell className="text-xs">{i.earliest_expiry ? new Date(i.earliest_expiry).toLocaleDateString() : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Card>
        </TabsContent>

        {/* FINANCIAL AUDIT */}
        <TabsContent value="financial" className="space-y-4">
          <Card><CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><Label className="text-xs">{t("from")}</Label><Input type="date" value={finFilters.fromDate} onChange={(e) => setFinFilters({ ...finFilters, fromDate: e.target.value })} className="mt-1 h-8 text-xs" /></div>
              <div><Label className="text-xs">{t("to")}</Label><Input type="date" value={finFilters.toDate} onChange={(e) => setFinFilters({ ...finFilters, toDate: e.target.value })} className="mt-1 h-8 text-xs" /></div>
              <div><Label className="text-xs">{t("branch")}</Label>
                <Select value={finFilters.branchId} onValueChange={(v) => setFinFilters({ ...finFilters, branchId: v })}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">{t("allBranches")}</SelectItem>
                    {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent></Select></div>
              <div><Label className="text-xs">{t("paymentMethod")}</Label>
                <Select value={finFilters.paymentMethod} onValueChange={(v) => setFinFilters({ ...finFilters, paymentMethod: v })}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allCategories")}</SelectItem>
                    <SelectItem value="cash">{t("cash")}</SelectItem>
                    <SelectItem value="card">{t("card")}</SelectItem>
                    <SelectItem value="mobile">{t("mobile")}</SelectItem>
                    <SelectItem value="credit">{t("credit")}</SelectItem>
                  </SelectContent></Select></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportSalesPDF} className="gap-1"><FileDown className="h-3.5 w-3.5" /> PDF</Button>
              <Button variant="outline" size="sm" onClick={exportSalesCSV} className="gap-1"><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</Button>
            </div>
          </CardContent></Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">{t("transactions")}</p><p className="text-xl font-bold">{salesTotals.count}</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">{t("totalRevenue")}</p><p className="text-xl font-bold text-primary">ILS {salesTotals.revenue.toFixed(0)}</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">{t("totalCost")}</p><p className="text-xl font-bold">ILS {salesTotals.cost.toFixed(0)}</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">{t("profit")}</p><p className="text-xl font-bold text-success">ILS {salesTotals.profit.toFixed(0)}</p></CardContent></Card>
          </div>

          <Tabs defaultValue="sales" className="space-y-3">
            <TabsList><TabsTrigger value="sales">{t("sales")}</TabsTrigger><TabsTrigger value="purchases">{t("purchases")}</TabsTrigger></TabsList>
            <TabsContent value="sales">
              <Card className="card-pharma overflow-hidden"><Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">{t("date")}</TableHead>
                  <TableHead className="text-xs">{t("saleNumber")}</TableHead>
                  <TableHead className="text-xs">{t("customer")}</TableHead>
                  <TableHead className="text-xs">{t("paymentMethod")}</TableHead>
                  <TableHead className="text-xs text-end">{t("total")}</TableHead>
                  <TableHead className="text-xs text-end">{t("profit")}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {salesData.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("noDataFound")}</TableCell></TableRow>
                  ) : salesData.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{s.date}</TableCell>
                      <TableCell className="text-xs font-mono">{s.sale_number}</TableCell>
                      <TableCell className="text-xs">{s.customer_name || "—"}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{s.payment_method}</Badge></TableCell>
                      <TableCell className="text-end text-xs">ILS {s.total_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-end text-xs text-success">ILS {s.profit.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table></Card>
            </TabsContent>
            <TabsContent value="purchases">
              <Card className="card-pharma overflow-hidden"><Table>
                <TableHeader><TableRow>
                  <TableHead className="text-xs">{t("date")}</TableHead>
                  <TableHead className="text-xs">{t("orderNumber")}</TableHead>
                  <TableHead className="text-xs">{t("supplier")}</TableHead>
                  <TableHead className="text-xs">{t("status")}</TableHead>
                  <TableHead className="text-xs text-end">{t("total")}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {purchaseData.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("noDataFound")}</TableCell></TableRow>
                  ) : purchaseData.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{p.date}</TableCell>
                      <TableCell className="text-xs font-mono">{p.order_number}</TableCell>
                      <TableCell className="text-xs">{p.supplier_name}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{p.status}</Badge></TableCell>
                      <TableCell className="text-end text-xs">ILS {p.total_amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table></Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* CUSTOMER AUDIT */}
        <TabsContent value="customers" className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCustPDF} className="gap-1"><FileDown className="h-3.5 w-3.5" /> PDF</Button>
            <Button variant="outline" size="sm" onClick={exportCustCSV} className="gap-1"><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</Button>
          </div>

          <Card className="card-pharma overflow-hidden"><Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">{t("name")}</TableHead>
              <TableHead className="text-xs">{t("phone")}</TableHead>
              <TableHead className="text-xs text-end">{t("totalDebt")}</TableHead>
              <TableHead className="text-xs text-end">{t("paid")}</TableHead>
              <TableHead className="text-xs text-end">{t("remaining")}</TableHead>
              <TableHead className="text-xs text-end">{t("totalInvoices")}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {customerData.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t("noDataFound")}</TableCell></TableRow>
              ) : customerData.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-sm font-medium">{c.name}</TableCell>
                  <TableCell className="text-xs">{c.phone || "—"}</TableCell>
                  <TableCell className="text-end text-xs">ILS {c.total_debt.toFixed(2)}</TableCell>
                  <TableCell className="text-end text-xs text-success">ILS {c.paid_amount.toFixed(2)}</TableCell>
                  <TableCell className="text-end text-xs text-destructive font-medium">ILS {c.remaining.toFixed(2)}</TableCell>
                  <TableCell className="text-end text-xs">{c.invoice_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default AuditReports;
