import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import type { Batch } from "@/hooks/useProducts";

interface BatchViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  batches: Batch[];
}

export function BatchViewDialog({ open, onOpenChange, productName, batches }: BatchViewDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const soon = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batches — {productName}</DialogTitle>
          <DialogDescription>{batches.length} batch{batches.length !== 1 ? "es" : ""} found</DialogDescription>
        </DialogHeader>
        {batches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No batches recorded</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Batch #</TableHead>
                <TableHead className="text-xs text-right">Qty</TableHead>
                <TableHead className="text-xs text-right">Cost</TableHead>
                <TableHead className="text-xs">Expiry</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => {
                const expired = b.expiry_date < today;
                const expiringSoon = !expired && b.expiry_date <= soon;
                return (
                  <TableRow key={b.id}>
                    <TableCell className="text-xs font-medium">{b.batch_number}</TableCell>
                    <TableCell className="text-xs text-right">{b.quantity}</TableCell>
                    <TableCell className="text-xs text-right">₪{b.cost_price.toFixed(2)}</TableCell>
                    <TableCell className="text-xs">{new Date(b.expiry_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {expired ? (
                        <Badge variant="destructive" className="text-[10px]">Expired</Badge>
                      ) : expiringSoon ? (
                        <Badge variant="outline" className="text-[10px] text-warning border-warning/40">
                          <AlertTriangle className="h-2.5 w-2.5 mr-1" />Expiring
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Active</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
