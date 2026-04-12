import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, X, CheckCircle2 } from "lucide-react";
import type { CompletedSale } from "@/hooks/useCompleteSale";

interface ReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  sale: CompletedSale | null;
}

export function ReceiptDialog({ open, onClose, sale }: ReceiptDialogProps) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center items-center">
          <CheckCircle2 className="h-10 w-10 text-success mb-1" />
          <DialogTitle>Sale Complete!</DialogTitle>
          <DialogDescription>{sale.saleNumber}</DialogDescription>
        </DialogHeader>

        {/* Receipt body */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm font-mono">
          <div className="text-center text-xs text-muted-foreground">
            {new Date(sale.date).toLocaleString()}
          </div>
          <Separator />
          {sale.items.map((item) => (
            <div key={item.product.id} className="flex justify-between gap-2">
              <div className="min-w-0">
                <span className="truncate block text-foreground">{item.product.name}</span>
                <span className="text-muted-foreground text-xs">
                  {item.quantity} × ₪{item.product.sell_price.toFixed(2)}
                </span>
              </div>
              <span className="text-foreground font-medium shrink-0">
                ₪{(item.product.sell_price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <Separator />
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">₪{sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discountTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-₪{sale.discountTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">₪{sale.total.toFixed(2)}</span>
            </div>
          </div>
          <Separator />
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="text-foreground capitalize">{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span className="text-foreground">₪{sale.amountPaid.toFixed(2)}</span>
            </div>
            {sale.change > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Change</span>
                <span className="text-success font-medium">₪{sale.change.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button className="flex-1" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
