import { Response } from "express";
import { prisma } from "../db.js";
import { AuthRequest, DashboardStats, SalesMetrics } from "../types/index.js";

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pharmacyId = req.pharmacyId || "ph-001";
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalSales, totalRevenue, totalCustomers, totalProducts, lowStockProducts, pendingOrders] =
      await Promise.all([
        prisma.sale.count({ where: { pharmacyId } }),
        prisma.sale.aggregate({
          where: { pharmacyId, saleDate: { gte: thirtyDaysAgo } },
          _sum: { totalAmount: true },
        }),
        prisma.customer.count({ where: { pharmacyId, isActive: true } }),
        prisma.product.count({ where: { pharmacyId, isActive: true } }),
        prisma.product.count({
          where: {
            pharmacyId,
            isActive: true,
            // Assuming we need to check stock via batches
          },
        }),
        prisma.purchaseOrder.count({
          where: { pharmacyId, status: { in: ["draft", "submitted", "partial"] } },
        }),
      ]);

    const stats: DashboardStats = {
      totalSales,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      pendingOrders,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

export const getSalesMetrics = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pharmacyId = req.pharmacyId || "ph-001";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayStats, topProducts, paymentStats] = await Promise.all([
      prisma.sale.aggregate({
        where: { pharmacyId, saleDate: { gte: today } },
        _count: true,
        _sum: { totalAmount: true },
      }),
      prisma.saleItem.groupBy({
        by: ["productId"],
        where: {
          sale: { pharmacyId, saleDate: { gte: today } },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
      prisma.sale.groupBy({
        by: ["paymentMethod"],
        where: { pharmacyId, saleDate: { gte: today } },
        _sum: { totalAmount: true },
      }),
    ]);

    const paymentMethods: Record<string, number> = {};
    paymentStats.forEach((stat) => {
      paymentMethods[stat.paymentMethod || "unknown"] = stat._sum.totalAmount || 0;
    });

    const metrics: SalesMetrics = {
      dailySales: todayStats._count || 0,
      dailyRevenue: todayStats._sum.totalAmount || 0,
      topProducts,
      paymentMethods,
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sales metrics" });
  }
};

export const getInventoryStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pharmacyId = req.pharmacyId || "ph-001";

    const [totalValue, lowStockItems, expiredItems] = await Promise.all([
      prisma.productBatch.aggregate({
        where: { product: { pharmacyId } },
        _sum: { quantity: true },
      }),
      prisma.product.findMany({
        where: { pharmacyId, isActive: true },
        select: {
          id: true,
          name: true,
          reorderLevel: true,
          batches: {
            select: { quantity: true },
            where: { expiryDate: { gt: new Date() } },
          },
        },
      }),
      prisma.productBatch.findMany({
        where: {
          expiryDate: { lte: new Date() },
          product: { pharmacyId },
        },
        include: { product: true },
      }),
    ]);

    res.json({
      totalValue: totalValue._sum.quantity || 0,
      lowStockItems: lowStockItems.filter(
        (p) =>
          (p.batches.reduce((sum, b) => sum + b.quantity, 0) || 0) < p.reorderLevel
      ),
      expiredItems,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch inventory status" });
  }
};
