/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { usePurchaseOrders, type PurchaseOrder, type POItem } from "@/hooks/usePurchaseOrders";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, PackageCheck, ClipboardList, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";

interface NewItem { product_id: string; product_name: string; quantity: number; unit_cost: number; }

const statusColors: Record<string, string> = {
  draft: "secondary", submitted: "default", partial: "outline", received: "default", cancelled: "destructive",
};

const Purchases = () => {
  const { orders, loading, createOrder, getOrderItems, receiveOrder, updateStatus } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const { products } = useProducts();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null);
  const [viewItems, setViewItems] = useState<POItem[]>([]);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const { t } = useLanguage();

  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [newItems, setNewItems] = useState<NewItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [itemCost, setItemCost] = useState(0);

  const [receiveItems, setReceiveItems] = useState<{ item_id: string; product_id: string; quantity: number; batch_number: string; expiry_date: string; cost_price: number }[]>([]);

  const filtered = orders.filter((o) =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.supplier_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalDraft = orders.filter((o) => o.status === "draft").length;
  const totalPending = orders.filter((o) => ["submitted", "partial"].includes(o.status)).length;
  const totalValue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  const addItem = () => {
    if (!selectedProduct) return;
    const p = products.find((pr) => pr.id === selectedProduct);
    if (!p) return;
    setNewItems([...newItems, { product_id: p.id, product_name: p.name, quantity: itemQty, unit_cost: itemCost || p.cost_price }]);
    setSelectedProduct(""); setItemQty(1); setItemCost(0);
  };

  const handleCreate = () => {
    if (!supplierId) { toast.error(t("selectSupplier")); return; }
    if (newItems.length === 0) { toast.error(t("orderItems")); return; }
    createOrder({
      supplier_id: supplierId, notes, expected_date: expectedDate,
      items: newItems.map((i) => ({ product_id: i.product_id, quantity: i.quantity, unit_cost: i.unit_cost })),
    });
    toast.success(t("purchaseCreated"));
    setCreateOpen(false); setSupplierId(""); setNotes(""); setExpectedDate(""); setNewItems([]);
  };

  const openView = (o: PurchaseOrder) => { setViewOrder(o); setViewItems(getOrderItems(o.id)); };

  const openReceive = () => {
    if (!viewOrder) return;
    setReceiveItems(
      viewItems.filter((i) => i.quantity_received < i.quantity_ordered).map((i) => ({
        item_id: i.id, product_id: i.product_id,
        quantity: i.quantity_ordered - i.quantity_received,
        batch_number: "", expiry_date: "", cost_price: i.unit_cost,
      }))
    );
    setReceiveOpen(true);
  };

  const handleReceive = () => {
    if (!viewOrder) return;
    const invalid = receiveItems.find((i) => !i.batch_number || !i.expiry_date);
    if (invalid) { toast.error(t("fillBatchInfo")); return; }
    receiveOrder(viewOrder.id, receiveItems);
    toast.success(t("stockReceived"));
    setReceiveOpen(false); setViewOrder(null);
  };

  return (
    <AppLayout title={t("purchases")} subtitle={t("managePurchaseOrders")}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("searchOrders")} value={search} onChange={(e) => setSearch(e.target.value)} className="ltr:pl-9 rtl:pr-9" />
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> {t("newOrder")}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><ClipboardList className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold text-foreground">{orders.length}</p><p className="text-xs text-muted-foreground">{t("totalOrders")}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Clock className="h-5 w-5 text-warning" /></div>
            <div><p className="text-2xl font-bold text-foreground">{totalDraft + totalPending}</p><p className="text-xs text-muted-foreground">{t("pending")}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-success" /></div>
            <div><p className="text-2xl font-bold text-foreground">ILS {totalValue.toFixed(0)}</p><p className="text-xs text-muted-foreground">{t("totalValue")}</p></div>
          </CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("orderNumber")}</TableHead>
                  <TableHead>{t("supplier")}</TableHead>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("items")}</TableHead>
                  <TableHead>{t("total")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="w-[80px]">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t("loading")}</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t("noOrdersFound")}</TableCell></TableRow>
                ) : (
                  filtered.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono font-medium">{o.order_number}</TableCell>
                      <TableCell>{o.supplier_name}</TableCell>
                      <TableCell>{new Date(o.order_date).toLocaleDateString()}</TableCell>
                      <TableCell>{o.item_count}</TableCell>
                      <TableCell>ILS {o.total_amount.toFixed(2)}</TableCell>
                      <TableCell><Badge variant={statusColors[o.status] as any}>{o.status}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => openView(o)}><Eye className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Order Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("newPurchaseOrder")}</DialogTitle>
            <DialogDescription>{t("createPODesc")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>{t("supplier")} *</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger><SelectValue placeholder={t("selectSupplier")} /></SelectTrigger>
                  <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>{t("expectedDate")}</Label>
                <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>{t("notes")}</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="border rounded-lg p-3 space-y-3">
              <Label className="font-semibold">{t("orderItems")}</Label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">{t("product")}</Label>
                  <Select value={selectedProduct} onValueChange={(v) => {
                    setSelectedProduct(v);
                    const p = products.find((pr) => pr.id === v);
                    if (p) setItemCost(p.cost_price);
                  }}>
                    <SelectTrigger><SelectValue placeholder={t("selectProduct")} /></SelectTrigger>
                    <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="w-20">
                  <Label className="text-xs">{t("qty")}</Label>
                  <Input type="number" min={1} value={itemQty} onChange={(e) => setItemQty(Number(e.target.value))} />
                </div>
                <div className="w-24">
                  <Label className="text-xs">{t("cost")}</Label>
                  <Input type="number" min={0} step={0.01} value={itemCost} onChange={(e) => setItemCost(Number(e.target.value))} />
                </div>
                <Button size="sm" onClick={addItem}>{t("add")}</Button>
              </div>
              {newItems.length > 0 && (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>{t("product")}</TableHead><TableHead>{t("qty")}</TableHead><TableHead>{t("cost")}</TableHead><TableHead>{t("total")}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {newItems.map((i, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{i.product_name}</TableCell>
                        <TableCell>{i.quantity}</TableCell>
                        <TableCell>ILS {i.unit_cost.toFixed(2)}</TableCell>
                        <TableCell>ILS {(i.quantity * i.unit_cost).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleCreate}>{t("createOrder")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={!!viewOrder && !receiveOpen} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("orderNumber")} {viewOrder?.order_number}</DialogTitle>
            <DialogDescription>{t("supplier")}: {viewOrder?.supplier_name} • {t("status")}: {viewOrder?.status}</DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader><TableRow>
              <TableHead>{t("product")}</TableHead><TableHead>{t("ordered")}</TableHead><TableHead>{t("received")}</TableHead><TableHead>{t("cost")}</TableHead><TableHead>{t("total")}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {viewItems.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>{i.product_name}</TableCell>
                  <TableCell>{i.quantity_ordered}</TableCell>
                  <TableCell>{i.quantity_received}</TableCell>
                  <TableCell>ILS {i.unit_cost.toFixed(2)}</TableCell>
                  <TableCell>ILS {i.total_cost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter>
            {viewOrder && ["draft", "submitted", "partial"].includes(viewOrder.status) && (
              <>
                {viewOrder.status === "draft" && (
                  <Button variant="outline" onClick={() => { updateStatus(viewOrder.id, "submitted"); setViewOrder(null); toast.success(t("orderSubmitted")); }}>
                    {t("submitOrder")}
                  </Button>
                )}
                <Button onClick={openReceive} className="gap-2">
                  <PackageCheck className="h-4 w-4" /> {t("receiveStock")}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Stock Dialog */}
      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("receiveStockTitle")} — {viewOrder?.order_number}</DialogTitle>
            <DialogDescription>{t("fillBatchInfo")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {receiveItems.map((item, idx) => {
              const poItem = viewItems.find((v) => v.id === item.item_id);
              return (
                <Card key={item.item_id}>
                  <CardContent className="p-3 space-y-2">
                    <p className="font-medium text-sm">{poItem?.product_name} — {t("qty")}: {item.quantity}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">{t("batchNumber")}</Label>
                        <Input value={item.batch_number} onChange={(e) => {
                          const copy = [...receiveItems]; copy[idx].batch_number = e.target.value; setReceiveItems(copy);
                        }} />
                      </div>
                      <div>
                        <Label className="text-xs">{t("expiryDate")}</Label>
                        <Input type="date" value={item.expiry_date} onChange={(e) => {
                          const copy = [...receiveItems]; copy[idx].expiry_date = e.target.value; setReceiveItems(copy);
                        }} />
                      </div>
                      <div>
                        <Label className="text-xs">{t("qtyReceived")}</Label>
                        <Input type="number" min={0} value={item.quantity} onChange={(e) => {
                          const copy = [...receiveItems]; copy[idx].quantity = Number(e.target.value); setReceiveItems(copy);
                        }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveOpen(false)}>{t("cancel")}</Button>
            <Button onClick={handleReceive}>{t("confirmReceipt")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Purchases;
