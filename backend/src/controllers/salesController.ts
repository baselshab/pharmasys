import { Response } from "express";
import { prisma } from "../db.js";
import { AuthRequest } from "../types/index.js";

export const getSalesReport = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { startDate, endDate } = req.query;
    const pharmacyId = req.pharmacyId || "ph-001";

    const start = startDate ? new Date(String(startDate)) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(String(endDate)) : new Date();

    const sales = await prisma.sale.findMany({
      where: {
        pharmacyId,
        saleDate: { gte: start, lte: end },
      },
      include: {
        customer: true,
        user: true,
        items: { include: { product: true } },
      },
      orderBy: { saleDate: "desc" },
    });

    const summary = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + s.totalAmount, 0),
      averageTransaction: sales.length > 0
        ? sales.reduce((sum, s) => sum + s.totalAmount, 0) / sales.length
        : 0,
      paymentMethods: sales.reduce(
        (acc, s) => {
          acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.totalAmount;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    res.json({ sales, summary });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sales report" });
  }
};

export const getCustomerDebts = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pharmacyId = req.pharmacyId || "ph-001";
    const { status } = req.query;

    const debts = await prisma.customerDebt.findMany({
      where: {
        customer: { pharmacyId },
        status: status ? String(status) : undefined,
      },
      include: { customer: true, sale: true },
      orderBy: { createdAt: "desc" },
    });

    const summary = {
      totalDebt: debts.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0),
      unpaidCount: debts.filter((d) => d.status === "unpaid").length,
      partialCount: debts.filter((d) => d.status === "partial").length,
      debts,
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer debts" });
  }
};

export const getCustomerPurchaseHistory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { customerId } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        sales: {
          include: { items: { include: { product: true } }, payments: true },
          orderBy: { saleDate: "desc" },
          take: 50,
        },
        debts: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const totalSpent = customer.sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalDebt = customer.debts.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

    res.json({
      customer,
      totalSpent,
      totalDebt,
      purchaseCount: customer.sales.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer history" });
  }
};

export const payDebt = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { debtId } = req.params;
    const { amount, reference } = req.body;

    const debt = await prisma.customerDebt.findUnique({
      where: { id: debtId },
    });

    if (!debt) {
      return res.status(404).json({ error: "Debt not found" });
    }

    const newPaidAmount = Math.min(debt.paidAmount + amount, debt.amount);
    const newStatus = newPaidAmount >= debt.amount ? "paid" : "partial";

    const updated = await prisma.customerDebt.update({
      where: { id: debtId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
    });

    // Create payment record
    if (debt.saleId) {
      await prisma.salePayment.create({
        data: {
          id: `payment-${Date.now()}`,
          saleId: debt.saleId,
          paymentMethod: "debt-payment",
          amount,
          reference,
        },
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to pay debt" });
  }
};

export const getTopCustomers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pharmacyId = req.pharmacyId || "ph-001";
    const { limit = 10 } = req.query;

    const customers = await prisma.customer.findMany({
      where: { pharmacyId, isActive: true },
      include: {
        _count: { select: { sales: true } },
        sales: { select: { totalAmount: true } },
      },
      orderBy: { sales: { _count: "desc" } },
      take: Number(limit),
    });

    const topCustomers = customers.map((c) => ({
      ...c,
      totalSpent: c.sales.reduce((sum, s) => sum + s.totalAmount, 0),
      purchaseCount: c._count.sales,
    }));

    res.json(topCustomers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top customers" });
  }
};
