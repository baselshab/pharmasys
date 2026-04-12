import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  userId?: string;
  pharmacyId?: string;
  role?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  skip?: number;
  take?: number;
}

export interface FilterOptions {
  pharmacyId: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export type AsyncHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
}

export interface SalesMetrics {
  dailySales: number;
  dailyRevenue: number;
  topProducts: Array<any>;
  paymentMethods: Record<string, number>;
}

export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  status: "low-stock" | "out-of-stock" | "expired";
}

export interface InventoryReport {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  expiredCount: number;
  lastUpdated: Date;
}
