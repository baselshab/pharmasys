import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CartPanel } from "@/components/pos/CartPanel";
import { PaymentDialog } from "@/components/pos/PaymentDialog";
import { ReceiptDialog } from "@/components/pos/ReceiptDialog";
import { usePOSProducts } from "@/hooks/usePOSProducts";
import { usePOSCart } from "@/hooks/usePOSCart";
import { useCompleteSale, type CompletedSale } from "@/hooks/useCompleteSale";
import { useCustomers } from "@/hooks/useCustomers";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { useDatabase } from "@/db/DatabaseProvider";
import { seedIfEmpty } from "@/db/seedData";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/i18n/LanguageProvider";

const POS = () => {
  const { db, isReady } = useDatabase();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptSale, setReceiptSale] = useState<CompletedSale | null>(null);
  const [seeded, setSeeded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  useEffect(() => {
    if (db && isReady && !seeded) {
      seedIfEmpty(db);
      setSeeded(true);
    }
  }, [db, isReady, seeded]);

  const { products, categories, allProducts } = usePOSProducts(search, categoryFilter);
  const { items, addItem, updateQuantity, removeItem, clearCart, totals } = usePOSCart();
  const { completeSale } = useCompleteSale();
  const { customers } = useCustomers();

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const product = allProducts.find((p) => p.barcode === barcode);
      if (product) {
        addItem(product);
        toast({ title: t("barcodeScanned"), description: `${product.name} ${t("addedToCart")}` });
      } else {
        toast({ title: t("productNotFound"), description: `${t("noProductBarcode")}: ${barcode}`, variant: "destructive" });
      }
    },
    [allProducts, addItem, t]
  );
  useBarcodeScanner(handleBarcodeScan);

  const handleCheckout = () => {
    if (items.length === 0) return;
    setPaymentOpen(true);
    if (isMobile) setCartOpen(false);
  };

  const handlePaymentConfirm = (method: string, amountPaid: number, customerId?: string, debtNotes?: string) => {
    const result = completeSale(items, totals, method, amountPaid, customerId, debtNotes);
    if (result) {
      setPaymentOpen(false);
      setReceiptSale(result);
      clearCart();
      const desc = method === "credit" && result.customerName
        ? `${result.saleNumber} — ${t("debtAddedTo")} ${result.customerName}`
        : `${result.saleNumber} — ILS ${result.total.toFixed(2)}`;
      toast({ title: t("saleCompleted"), description: desc });
    } else {
      toast({ title: t("saleFailed"), description: t("errorProcessing"), variant: "destructive" });
    }
  };

  const handleReceiptClose = () => {
    setReceiptSale(null);
    setSearch((s) => s + " ");
    setTimeout(() => setSearch((s) => s.trim()), 0);
  };

  const cartPanel = (
    <CartPanel
      items={items}
      totals={totals}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeItem}
      onClearCart={clearCart}
      onCheckout={handleCheckout}
    />
  );

  return (
    <AppLayout title={t("pointOfSale")} subtitle={t("processSales")}>
      <div className="flex h-[calc(100vh-8rem)] -m-4 md:-m-6">
        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          <ProductGrid
            products={products}
            categories={categories}
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            onAddToCart={addItem}
          />
        </div>

        {!isMobile && (
          <div className="w-80 lg:w-96 shrink-0">
            {cartPanel}
          </div>
        )}
      </div>

      {isMobile && (
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-4 ltr:right-4 rtl:left-4 z-40 rounded-full h-14 w-14 shadow-lg p-0"
            >
              <ShoppingCart className="h-6 w-6" />
              {totals.itemCount > 0 && (
                <span className="absolute -top-1 ltr:-right-1 rtl:-left-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                  {totals.itemCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-2xl">
            {cartPanel}
          </SheetContent>
        </Sheet>
      )}

      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        total={totals.total}
        customers={customers}
        onConfirm={handlePaymentConfirm}
      />

      <ReceiptDialog
        open={!!receiptSale}
        onClose={handleReceiptClose}
        sale={receiptSale}
      />
    </AppLayout>
  );
};

export default POS;
