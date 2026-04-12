/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Printer, DollarSign, FileText } from "lucide-react";
import { useCustomerDebts, type CustomerDebt } from "@/hooks/useCustomerDebts";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Customer } from "@/hooks/useCustomers";
import { toast } from "sonner";

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export function CustomerDetailsDialog({ open, onOpenChange, customer }: CustomerDetailsDialogProps) {
  const { debts, loadDebts, payDebt } = useCustomerDebts();
  const [payingDebtId, setPayingDebtId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const { t } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && customer) loadDebts(customer.id);
  }, [open, customer, loadDebts]);

  if (!customer) return null;

  const totalDebt = debts.reduce((s, d) => s + (d.amount - d.paid_amount), 0);

  const handlePay = (debtId: string) => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;
    payDebt(debtId, amount);
    setPayingDebtId(null);
    setPayAmount("");
    toast.success(t("paymentRecorded"));
  };

  const handlePrintInvoice = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="${document.dir}">
      <head>
        <title>${t("customerInvoice")} - ${customer.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 14px; direction: ${document.dir}; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: ${document.dir === "rtl" ? "right" : "left"}; }
          th { background: #f5f5f5; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20px; }
          .summary { margin: 15px 0; padding: 10px; background: #f9f9f9; border-radius: 4px; }
          .total { font-size: 18px; font-weight: bold; color: #c00; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-row items-center justify-between gap-2">
          <div>
            <DialogTitle className="text-lg">{customer.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">{customer.phone} {customer.email ? `• ${customer.email}` : ""}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrintInvoice}>
            <Printer className="h-4 w-4" />
            {t("printInvoice")}
          </Button>
        </DialogHeader>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground">{t("totalDebt")}</p>
            <p className="text-xl font-bold text-destructive">ILS {totalDebt.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground">{t("totalInvoices")}</p>
            <p className="text-xl font-bold text-foreground">{debts.length}</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground">{t("creditLimit")}</p>
            <p className="text-xl font-bold text-foreground">ILS {customer.credit_limit.toFixed(2)}</p>
          </div>
        </div>

        <Separator />

        {/* Debts list */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {debts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
              {t("noDebts")}
            </div>
          ) : (
            <div className="space-y-3">
              {debts.map((debt) => (
                <div key={debt.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={debt.status === "paid" ? "secondary" : debt.status === "partial" ? "outline" : "destructive"} className="text-[10px]">
                        {t(debt.status as any)}
                      </Badge>
                      {debt.sale_number && <span className="text-xs font-mono text-muted-foreground">{debt.sale_number}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(debt.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Items */}
                  {debt.items.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs h-8">{t("product")}</TableHead>
                          <TableHead className="text-xs h-8 text-center">{t("qty")}</TableHead>
                          <TableHead className="text-xs h-8 text-end">{t("price")}</TableHead>
                          <TableHead className="text-xs h-8 text-end">{t("total")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {debt.items.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs py-1">{item.name}</TableCell>
                            <TableCell className="text-xs py-1 text-center">{item.quantity}</TableCell>
                            <TableCell className="text-xs py-1 text-end">ILS {item.unit_price.toFixed(2)}</TableCell>
                            <TableCell className="text-xs py-1 text-end">ILS {item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("amount")}: </span>
                      <span className="font-semibold">ILS {debt.amount.toFixed(2)}</span>
                      {debt.paid_amount > 0 && (
                        <span className="text-success ms-2">({t("paid")}: ILS {debt.paid_amount.toFixed(2)})</span>
                      )}
                    </div>
                    {debt.status !== "paid" && (
                      payingDebtId === debt.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            className="w-24 h-8 text-xs"
                            autoFocus
                          />
                          <Button size="sm" className="h-8 text-xs" onClick={() => handlePay(debt.id)}>{t("pay")}</Button>
                          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setPayingDebtId(null)}>{t("cancel")}</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setPayingDebtId(debt.id); setPayAmount(""); }}>
                          <DollarSign className="h-3 w-3" />
                          {t("recordPayment")}
                        </Button>
                      )
                    )}
                  </div>
                  {debt.notes && <p className="text-xs text-muted-foreground">{debt.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Hidden printable content */}
        <div className="hidden">
          <div ref={printRef}>
            <div className="header">
              <h1>PharmaSYS</h1>
              <h2>{t("customerInvoice")}</h2>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
            <div className="summary">
              <p><strong>{t("name")}:</strong> {customer.name}</p>
              <p><strong>{t("phone")}:</strong> {customer.phone || "—"}</p>
              <p><strong>{t("email")}:</strong> {customer.email || "—"}</p>
              <p className="total"><strong>{t("totalDebt")}:</strong> ILS {totalDebt.toFixed(2)}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>{t("date")}</th>
                  <th>{t("saleNumber")}</th>
                  <th>{t("amount")}</th>
                  <th>{t("paid")}</th>
                  <th>{t("remaining")}</th>
                  <th>{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {debts.map((d) => (
                  <tr key={d.id}>
                    <td>{new Date(d.created_at).toLocaleDateString()}</td>
                    <td>{d.sale_number || "—"}</td>
                    <td>ILS {d.amount.toFixed(2)}</td>
                    <td>ILS {d.paid_amount.toFixed(2)}</td>
                    <td>ILS {(d.amount - d.paid_amount).toFixed(2)}</td>
                    <td>{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
