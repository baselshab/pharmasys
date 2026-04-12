import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Banknote, CreditCard, Smartphone, Check, HandCoins } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Customer } from "@/hooks/useCustomers";

const PAYMENT_METHODS = [
  { id: "cash", labelKey: "cash" as const, icon: Banknote },
  { id: "card", labelKey: "card" as const, icon: CreditCard },
  { id: "mobile", labelKey: "mobile" as const, icon: Smartphone },
  { id: "credit", labelKey: "credit" as const, icon: HandCoins },
] as const;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  customers: Customer[];
  onConfirm: (method: string, amountPaid: number, customerId?: string, debtNotes?: string) => void;
}

export function PaymentDialog({ open, onOpenChange, total, customers, onConfirm }: PaymentDialogProps) {
  const [method, setMethod] = useState<string>("cash");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [debtNotes, setDebtNotes] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    if (open) {
      setMethod("cash");
      setAmountPaid("");
      setSelectedCustomerId("");
      setDebtNotes("");
    }
  }, [open]);

  const paid = parseFloat(amountPaid) || 0;
  const change = method === "cash" ? Math.max(0, paid - total) : 0;
  const isValid = method === "credit"
    ? !!selectedCustomerId
    : method === "cash"
      ? paid >= total
      : true;

  const handleConfirm = () => {
    const finalPaid = method === "credit" ? 0 : method === "cash" ? paid : total;
    onConfirm(method, finalPaid, method === "credit" ? selectedCustomerId : undefined, method === "credit" ? debtNotes : undefined);
  };

  const quickAmounts = [
    Math.ceil(total),
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("completePayment")}</DialogTitle>
          <DialogDescription>{t("totalAmountDue")}: ILS {total.toFixed(2)}</DialogDescription>
        </DialogHeader>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{t("paymentMethod")}</Label>
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-xs font-medium ${
                  method === m.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <m.icon className="h-5 w-5" />
                {t(m.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Credit/Debt options */}
        {method === "credit" && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">{t("selectCustomer")} *</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t("selectCustomer")} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCustomerId && (() => {
              const cust = customers.find(c => c.id === selectedCustomerId);
              return cust ? (
                <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("currentDebt")}</span>
                    <span className="font-medium text-destructive">ILS {cust.credit_balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("creditLimit")}</span>
                    <span className="font-medium">ILS {cust.credit_limit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("newDebt")}</span>
                    <span className="font-bold text-destructive">ILS {total.toFixed(2)}</span>
                  </div>
                </div>
              ) : null;
            })()}
            <div>
              <Label className="text-xs text-muted-foreground">{t("notes")}</Label>
              <Textarea
                value={debtNotes}
                onChange={(e) => setDebtNotes(e.target.value)}
                placeholder={t("debtNotesPlaceholder")}
                className="mt-1 h-16"
              />
            </div>
          </div>
        )}

        {/* Cash input */}
        {method === "cash" && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">{t("amountReceived")}</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="text-lg font-semibold mt-1"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setAmountPaid(amt.toString())}
                >
                  ILS {amt}
                </Button>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("change")}</span>
              <span className={`text-lg font-bold ${change > 0 ? "text-success" : "text-foreground"}`}>
                ILS {change.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <Button onClick={handleConfirm} disabled={!isValid} className="w-full" size="lg">
          <Check className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {method === "credit" ? t("confirmDebt") : t("confirmPayment")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
