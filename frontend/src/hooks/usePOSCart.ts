import { useState, useCallback, useMemo } from "react";
import type { POSProduct } from "./usePOSProducts";

export interface CartItem {
  product: POSProduct;
  quantity: number;
  discount: number; // per-item discount amount
}

export function usePOSCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: POSProduct) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      if (product.stock <= 0) return prev;
      return [...prev, { product, quantity: 1, discount: 0 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.min(quantity, i.product.stock) }
            : i
        )
      );
    }
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.product.sell_price * i.quantity, 0);
    const discountTotal = items.reduce((sum, i) => sum + i.discount * i.quantity, 0);
    const total = subtotal - discountTotal;
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    return { subtotal, discountTotal, total, itemCount };
  }, [items]);

  return { items, addItem, updateQuantity, removeItem, clearCart, totals };
}
