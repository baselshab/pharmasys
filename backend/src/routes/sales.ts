import { Router, Request, Response } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { pharmacyId: "ph-001" },
      orderBy: { saleDate: "desc" },
      take: 100,
      include: { customer: true, user: true, items: { include: { product: true } } },
    });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: { 
        customer: true, 
        user: true, 
        items: { include: { product: true, batch: true } },
        payments: true,
      },
    });
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sale" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { customerId, userId, items, paymentMethod, notes, discountAmount = 0 } = req.body;
    
    let subtotal = 0;
    const saleItems = [];
    
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      
      const itemTotal = product.sellPrice * item.quantity;
      subtotal += itemTotal;
      
      saleItems.push({
        id: `si-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.sellPrice,
        discount: item.discount || 0,
        totalPrice: itemTotal - (item.discount || 0),
      });
      
      if (item.batchId) {
        await prisma.productBatch.update({
          where: { id: item.batchId },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }
    
    const totalAmount = subtotal - discountAmount;
    const saleNumber = `S${Date.now()}`;
    
    const sale = await prisma.sale.create({
      data: {
        id: `sale-${Date.now()}`,
        pharmacyId: "ph-001",
        customerId,
        userId,
        saleNumber,
        subtotal,
        discountAmount,
        totalAmount,
        paymentMethod,
        amountPaid: totalAmount,
        changeAmount: 0,
        notes,
        items: { create: saleItems },
      },
      include: { items: { include: { product: true } } },
    });
    
    res.status(201).json(sale);
  } catch (error) {
    console.error("Sale error:", error);
    res.status(500).json({ error: "Failed to create sale" });
  }
});

router.put("/:id/refund", async (req: Request, res: Response) => {
  try {
    const sale = await prisma.sale.update({
      where: { id: req.params.id },
      data: { status: "refunded" },
    });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: "Failed to refund sale" });
  }
});

export default router;