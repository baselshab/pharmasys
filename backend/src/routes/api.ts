import { Router, Request, Response } from "express";
import {
  getDashboardStats,
  getSalesMetrics,
  getInventoryStatus,
} from "../controllers/dashboardController.js";
import {
  getProductsByCategory,
  searchProducts,
  getStockAdjustmentHistory,
  adjustStock,
  getExpiredProducts,
  getLowStockProducts,
} from "../controllers/productController.js";
import {
  getSalesReport,
  getCustomerDebts,
  getCustomerPurchaseHistory,
  payDebt,
  getTopCustomers,
} from "../controllers/salesController.js";
import { AuthRequest } from "../types/index.js";

const router = Router();

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/sales-metrics", getSalesMetrics);
router.get("/dashboard/inventory", getInventoryStatus);

// Product routes
router.get("/products/category/:categoryId", getProductsByCategory);
router.get("/products/search", searchProducts);
router.get("/products/:productId/stock-history", getStockAdjustmentHistory);
router.post("/products/:productId/adjust-stock", adjustStock);
router.get("/products/expired", getExpiredProducts);
router.get("/products/low-stock", getLowStockProducts);

// Sales & Reports routes
router.get("/reports/sales", getSalesReport);
router.get("/reports/customer-debts", getCustomerDebts);
router.get("/customers/:customerId/purchase-history", getCustomerPurchaseHistory);
router.post("/customers/:customerId/debts/:debtId/pay", payDebt);
router.get("/customers/top", getTopCustomers);

// Health check
router.get("/", (_req: AuthRequest, res: Response) => {
  res.json({ message: "API running", timestamp: new Date().toISOString() });
});

export default router;
