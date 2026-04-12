import { z } from "zod";

// Product validation
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  genericName: z.string().optional(),
  barcode: z.string().optional(),
  unit: z.string().default("piece"),
  sellPrice: z.number().positive("Sell price must be positive"),
  costPrice: z.number().nonnegative().default(0),
  reorderLevel: z.number().nonnegative().default(10),
  maxStock: z.number().nonnegative().default(1000),
  requiresPrescription: z.boolean().default(false),
  categoryId: z.string().optional(),
  pharmacyId: z.string().default("ph-001"),
});

export type ProductInput = z.infer<typeof productSchema>;

// Customer validation
export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  loyaltyPoints: z.number().nonnegative().default(0),
  creditLimit: z.number().nonnegative().default(0),
  pharmacyId: z.string().default("ph-001"),
});

export type CustomerInput = z.infer<typeof customerSchema>;

// Sale validation
export const saleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  batchId: z.string().optional(),
  discount: z.number().nonnegative().default(0),
});

export const saleSchema = z.object({
  customerId: z.string().optional(),
  userId: z.string(),
  items: z.array(saleItemSchema),
  paymentMethod: z.enum(["cash", "card", "mobile", "credit", "split"]),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  notes: z.string().optional(),
  pharmacyId: z.string().default("ph-001"),
});

export type SaleInput = z.infer<typeof saleSchema>;

// Supplier validation
export const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  paymentTerms: z.string().optional(),
  pharmacyId: z.string().default("ph-001"),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

// User validation
export const userSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  roles: z.array(z.enum(["admin", "pharmacist", "cashier", "manager"])).default(["cashier"]),
  pharmacyId: z.string().default("ph-001"),
});

export type UserInput = z.infer<typeof userSchema>;

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parentId: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// Stock adjustment validation
export const stockAdjustmentSchema = z.object({
  quantity: z.number().positive(),
  adjustmentType: z.enum(["increase", "decrease", "damage", "expired", "correction"]),
  reason: z.string().optional(),
  batchId: z.string().optional(),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;

// Purchase order validation
export const purchaseOrderItemSchema = z.object({
  productId: z.string(),
  quantityOrdered: z.number().positive(),
  unitCost: z.number().positive(),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string(),
  items: z.array(purchaseOrderItemSchema),
  notes: z.string().optional(),
  expectedDate: z.string().datetime().optional(),
});

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().positive().default(1),
  pageSize: z.number().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
