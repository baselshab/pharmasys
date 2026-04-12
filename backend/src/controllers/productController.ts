import { Response } from "express";
import { prisma } from "../db.js";
import { AuthRequest } from "../types/index.js";

export const getProductsByCategory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { categoryId } = req.params;
    const pharmacyId = req.pharmacyId || "ph-001";

    const products = await prisma.product.findMany({
      where: {
        categoryId,
        pharmacyId,
        isActive: true,
      },
      include: {
        batches: {
          where: { quantity: { gt: 0 }, expiryDate: { gt: new Date() } },
        },
        category: true,
      },
      orderBy: { name: "asc" },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products by category" });
  }
};

export const searchProducts = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { query } = req.query;
    const pharmacyId = req.pharmacyId || "ph-001";

    if (!query) {
      return res.status(400).json({ error: "Search query required" });
    }

    const searchTerm = String(query).toLowerCase();
    const products = await prisma.product.findMany({
      where: {
        pharmacyId,
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { genericName: { contains: searchTerm, mode: "insensitive" } },
          { barcode: { contains: searchTerm } },
        ],
      },
      include: { batches: true, category: true },
      take: 20,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to search products" });
  }
};

export const getStockAdjustmentHistory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { productId } = req.params;
    const pharmacyId = req.pharmacyId || "ph-001";

    const adjustments = await prisma.stockAdjustment.findMany({
      where: {
        productId,
        product: { pharmacyId },
      },
      include: { user: true, product: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(adjustments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock adjustments" });
  }
};

export const adjustStock = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { productId } = req.params;
    const { quantity, adjustmentType, reason, batchId } = req.body;
    const userId = req.userId || "system";

    if (!["increase", "decrease", "damage", "expired", "correction"].includes(adjustmentType)) {
      return res.status(400).json({ error: "Invalid adjustment type" });
    }

    const adjustment = await prisma.stockAdjustment.create({
      data: {
        id: `adj-${Date.now()}`,
        productId,
        batchId,
        userId,
        adjustmentType,
        quantity,
        reason,
      },
      include: { product: true, user: true },
    });

    // Update batch quantity if provided
    if (batchId) {
      const quantityChange = adjustmentType === "increase" ? quantity : -quantity;
      await prisma.productBatch.update({
        where: { id: batchId },
        data: { quantity: { increment: quantityChange } },
      });
    }

    res.status(201).json(adjustment);
  } catch (error) {
    res.status(500).json({ error: "Failed to adjust stock" });
  }
};

export const getExpiredProducts = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pharmacyId = req.pharmacyId || "ph-001";

    const expiredBatches = await prisma.productBatch.findMany({
      where: {
        expiryDate: { lte: new Date() },
        product: { pharmacyId },
      },
      include: { product: true, supplier: true },
      orderBy: { expiryDate: "asc" },
    });

    res.json(expiredBatches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expired products" });
  }
};

export const getLowStockProducts = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pharmacyId = req.pharmacyId || "ph-001";

    const lowStockProducts = await prisma.product.findMany({
      where: { pharmacyId, isActive: true },
      include: {
        batches: {
          select: { quantity: true, expiryDate: true },
          where: { expiryDate: { gt: new Date() } },
        },
      },
    });

    const filtered = lowStockProducts
      .map((p) => ({
        ...p,
        totalQuantity: p.batches.reduce((sum, b) => sum + b.quantity, 0),
      }))
      .filter((p) => p.totalQuantity < p.reorderLevel)
      .sort((a, b) => a.totalQuantity - b.totalQuantity);

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch low stock products" });
  }
};
