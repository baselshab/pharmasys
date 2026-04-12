// ID Generators
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateProductId(): string {
  return generateId("prod");
}

export function generateCustomerId(): string {
  return generateId("cust");
}

export function generateSaleId(): string {
  return generateId("sale");
}

export function generateSaleNumber(): string {
  return `S${Date.now()}`;
}

export function generateBatchId(): string {
  return generateId("batch");
}

export function generateSupplierId(): string {
  return generateId("sup");
}

export function generateUserId(): string {
  return generateId("user");
}

export function generateCategoryId(): string {
  return generateId("cat");
}

export function generateAdjustmentId(): string {
  return generateId("adj");
}

export function generatePurchaseOrderId(): string {
  return generateId("po");
}

// Pagination utilities
export function getPaginationParams(page: number = 1, pageSize: number = 20) {
  const skip = (page - 1) * pageSize;
  return { skip, take: pageSize };
}

// Date utilities
export function getDateRange(days: number = 30) {
  const end = new Date();
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

export function getTodayRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { start: today, end: tomorrow };
}

// Parse utilities
export function parseDate(dateString?: string): Date | undefined {
  if (!dateString) return undefined;
  return new Date(dateString);
}

export function parseNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

// validation utilities
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  const re = /^[\d\+\-\(\)\s]{10,}$/;
  return re.test(phone);
}

export function isValidBarcode(barcode: string): boolean {
  return barcode.length >= 8 && barcode.length <= 14;
}

// Calculation utilities
export function calculateTotal(
  subtotal: number,
  discount: number = 0,
  tax: number = 0
): number {
  return subtotal - discount + tax;
}

export function calculateDiscount(price: number, discountPercent: number): number {
  return (price * discountPercent) / 100;
}

export function calculateProfit(sellPrice: number, costPrice: number): number {
  return sellPrice - costPrice;
}

export function calculateProfitMargin(sellPrice: number, costPrice: number): number {
  if (costPrice === 0) return 0;
  return ((sellPrice - costPrice) / costPrice) * 100;
}

// Stock level classification
export function getStockLevel(current: number, reorderLevel: number, maxStock: number): string {
  if (current === 0) return "out-of-stock";
  if (current <= reorderLevel) return "low-stock";
  if (current >= maxStock) return "overstocked";
  return "normal";
}

// Status formatting
export function formatSaleStatus(status: string): string {
  const statusMap: Record<string, string> = {
    completed: "Completed",
    refunded: "Refunded",
    partial_refund: "Partially Refunded",
    on_hold: "On Hold",
  };
  return statusMap[status] || status;
}

export function formatPaymentMethod(method: string): string {
  const methodMap: Record<string, string> = {
    cash: "Cash",
    card: "Card",
    mobile: "Mobile Payment",
    credit: "Credit",
    split: "Split Payment",
  };
  return methodMap[method] || method;
}

export function formatUserRole(role: string): string {
  const roleMap: Record<string, string> = {
    admin: "Administrator",
    pharmacist: "Pharmacist",
    cashier: "Cashier",
    manager: "Manager",
  };
  return roleMap[role] || role;
}

// Formatting utilities
export function formatCurrency(amount: number, currency: string = "SAR"): string {
  return `${currency} ${amount.toFixed(2)}`;
}

export function formatDate(date: Date, format: "short" | "long" = "short"): string {
  if (format === "short") {
    return date.toISOString().split("T")[0];
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Error handling
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleError(error: any) {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      message: error.message,
      details: error.details,
    };
  }

  if (error.name === "PrismaClientKnownRequestError") {
    if ((error as any).code === "P2025") {
      return {
        status: 404,
        message: "Resource not found",
      };
    }
    if ((error as any).code === "P2002") {
      return {
        status: 409,
        message: "Duplicate entry",
        field: (error as any).meta?.target?.[0],
      };
    }
  }

  return {
    status: 500,
    message: "Internal server error",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  };
}

// Array utilities
export function getUniqueValues<T>(array: T[], key: keyof T): T[key][] {
  return [...new Set(array.map((item) => item[key]))];
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) result[groupKey] = [];
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((sum, item) => {
    const value = item[key];
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
}

// Async utilities
export async function asyncMap<T, U>(
  array: T[],
  callback: (item: T) => Promise<U>
): Promise<U[]> {
  return Promise.all(array.map(callback));
}

export async function asyncFilter<T>(
  array: T[],
  predicate: (item: T) => Promise<boolean>
): Promise<T[]> {
  const results = await Promise.all(array.map(predicate));
  return array.filter((_, i) => results[i]);
}
