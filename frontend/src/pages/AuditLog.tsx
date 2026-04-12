import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuditLog } from "@/hooks/useAuditLog";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { FileDown, FileSpreadsheet, ScrollText } from "lucide-react";

const AuditLogPage = () => {
  const { t, isRTL } = useLanguage();
  const { entries, loadEntries } = useAuditLog();
  const [filters, setFilters] = useState({ fromDate: "", toDate: "", action: "", tableName: "" });

  useEffect(() => { loadEntries(filters.fromDate || filters.toDate || filters.action || filters.tableName ? filters : undefined); }, [loadEntries, filters]);

  const actionColor = (a: string) => {
    if (a.includes("DELETE") || a.includes("delete")) return "destructive";
    if (a.includes("INSERT") || a.includes("create") || a.includes("add")) return "secondary";
    return "outline";
  };

  const headers = [t("date"), t("user"), t("action"), t("table"), t("details")];
  const rows = entries.map((e) => [new Date(e.created_at).toLocaleString(), e.user_name, e.action, e.table_name, e.details]);

  return (
    <AppLayout title={t("auditLog")} subtitle={t("auditLogDesc")}>
      <div className="space-y-4">
        <Card><CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div><Label className="text-xs">{t("from")}</Label><Input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} className="mt-1 h-8 text-xs" /></div>
            <div><Label className="text-xs">{t("to")}</Label><Input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} className="mt-1 h-8 text-xs" /></div>
            <div><Label className="text-xs">{t("action")}</Label>
              <Select value={filters.action} onValueChange={(v) => setFilters({ ...filters, action: v === "all" ? "" : v })}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder={t("allCategories")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCategories")}</SelectItem>
                  <SelectItem value="CREATE">CREATE</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="SALE">SALE</SelectItem>
                </SelectContent>
              </Select></div>
            <div><Label className="text-xs">{t("table")}</Label>
              <Select value={filters.tableName} onValueChange={(v) => setFilters({ ...filters, tableName: v === "all" ? "" : v })}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder={t("allCategories")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCategories")}</SelectItem>
                  <SelectItem value="products">{t("products")}</SelectItem>
                  <SelectItem value="sales">{t("sales")}</SelectItem>
                  <SelectItem value="customers">{t("customers")}</SelectItem>
                  <SelectItem value="suppliers">{t("suppliers")}</SelectItem>
                </SelectContent>
              </Select></div>
            <div className="flex items-end gap-1">
              <Button variant="outline" size="sm" onClick={() => exportToPDF(t("auditLog"), headers, rows, isRTL)} className="gap-1 h-8"><FileDown className="h-3.5 w-3.5" /></Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(headers, rows, "audit_log")} className="gap-1 h-8"><FileSpreadsheet className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </CardContent></Card>

        <Card className="card-pharma overflow-hidden"><Table>
          <TableHeader><TableRow>
            <TableHead className="text-xs">{t("date")}</TableHead>
            <TableHead className="text-xs">{t("user")}</TableHead>
            <TableHead className="text-xs">{t("action")}</TableHead>
            <TableHead className="text-xs">{t("table")}</TableHead>
            <TableHead className="text-xs">{t("details")}</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                <ScrollText className="h-8 w-8 mx-auto mb-2 opacity-30" />{t("noDataFound")}
              </TableCell></TableRow>
            ) : entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-xs font-medium">{e.user_name}</TableCell>
                <TableCell><Badge variant={actionColor(e.action) as any} className="text-[10px]">{e.action}</Badge></TableCell>
                <TableCell className="text-xs">{e.table_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{e.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></Card>
      </div>
    </AppLayout>
  );
};

export default AuditLogPage;
