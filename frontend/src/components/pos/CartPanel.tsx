import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import type { CartItem } from "@/hooks/usePOSCart";
import { useLanguage } from "@/i18n/LanguageProvider";

interface CartPanelProps {
  items: CartItem[];
  totals: { subtotal: number; discountTotal: number; total: number; itemCount: number };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function CartPanel({ items, totals, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout }: CartPanelProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full border-s bg-card">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">{t("cart")}</span>
          {totals.itemCount > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
              {totals.itemCount}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearCart} className="text-xs text-muted-foreground h-7">
            {t("clear")}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          <div className="text-center">
            <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>{t("cartEmpty")}</p>
            <p className="text-xs mt-1">{t("tapProducts")}</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {items.map((item) => (
              <div key={item.product.id} className="rounded-lg border bg-background p-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">₪{item.product.sell_price.toFixed(2)} / {item.product.unit}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => onRemoveItem(item.product.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    ₪{(item.product.sell_price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {items.length > 0 && (
        <div className="border-t p-4 space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="text-foreground">₪{totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discountTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("discount")}</span>
                <span className="text-destructive">-₪{totals.discountTotal.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span className="text-foreground">{t("total")}</span>
              <span className="text-foreground">₪{totals.total.toFixed(2)}</span>
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={onCheckout}>
            {t("charge")} ₪{totals.total.toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  );
}
