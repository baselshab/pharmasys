import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200),
  generic_name: z.string().max(200).optional().default(""),
  barcode: z.string().max(50).optional().default(""),
  unit: z.string().min(1),
  sell_price: z.number().min(0.01, "Sell price must be greater than 0"),
  cost_price: z.number().min(0, "Cost price cannot be negative"),
  category_id: z.string().optional().default(""),
  requires_prescription: z.boolean(),
  reorder_level: z.number().int().min(0),
  dosage_form: z.string().optional().default("other"),
  supplier_id: z.string().optional().default(""),
});

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required").max(200),
  phone: z.string().max(20).optional().default(""),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().max(500).optional().default(""),
  credit_limit: z.number().min(0, "Credit limit cannot be negative"),
});

export const branchSchema = z.object({
  name: z.string().trim().min(1, "Branch name is required").max(200),
  address: z.string().max(500).optional().default(""),
  phone: z.string().max(20).optional().default(""),
  manager_name: z.string().max(200).optional().default(""),
});

export const supplierSchema = z.object({
  name: z.string().trim().min(1, "Supplier name is required").max(200),
  contact_person: z.string().max(200).optional().default(""),
  phone: z.string().max(20).optional().default(""),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().max(500).optional().default(""),
  payment_terms: z.string().max(200).optional().default(""),
});

export type ProductFormSchema = z.infer<typeof productSchema>;
export type CustomerFormSchema = z.infer<typeof customerSchema>;
export type BranchFormSchema = z.infer<typeof branchSchema>;
export type SupplierFormSchema = z.infer<typeof supplierSchema>;
