// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  PHARMACIST: "pharmacist",
  CASHIER: "cashier",
  MANAGER: "manager",
} as const;

export const ADMIN_ROLES = [USER_ROLES.ADMIN];
export const MANAGER_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER];
export const STAFF_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.PHARMACIST];
export const ALL_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.PHARMACIST, USER_ROLES.CASHIER];

// Sale Status
export const SALE_STATUS = {
  COMPLETED: "completed",
  REFUNDED: "refunded",
  PARTIAL_REFUND: "partial_refund",
  ON_HOLD: "on_hold",
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  MOBILE: "mobile",
  CREDIT: "credit",
  SPLIT: "split",
} as const;

// Purchase Order Status
export const PO_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  PARTIAL: "partial",
  RECEIVED: "received",
  CANCELLED: "cancelled",
} as const;

// Stock Adjustment Types
export const ADJUSTMENT_TYPES = {
  INCREASE: "increase",
  DECREASE: "decrease",
  DAMAGE: "damage",
  EXPIRED: "expired",
  CORRECTION: "correction",
} as const;

// Customer Debt Status
export const DEBT_STATUS = {
  UNPAID: "unpaid",
  PARTIAL: "partial",
  PAID: "paid",
} as const;

// Batch Status
export const BATCH_STATUS = {
  ACTIVE: "active",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
  EXPIRED: "expired",
  EXPIRING_SOON: "expiring_soon",
} as const;

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  LATE: "late",
  ABSENT: "absent",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Resource not found",
  INVALID_INPUT: "Invalid input data",
  DUPLICATE_ENTRY: "Duplicate entry",
  INTERNAL_ERROR: "Internal server error",
  DATABASE_ERROR: "Database error",
  VALIDATION_ERROR: "Validation error",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
  RETRIEVED: "Resource retrieved successfully",
} as const;

// Unit Types
export const UNIT_TYPES = [
  "piece",
  "box",
  "pack",
  "bottle",
  "strip",
  "tube",
  "sachet",
  "vial",
  "injectable",
  "blister",
  "carton",
  "jar",
] as const;

// Default Values
export const DEFAULTS = {
  PHARMACY_ID: "ph-001",
  BRANCH_ID: "branch-main",
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REORDER_LEVEL: 10,
  MAX_STOCK: 1000,
  COST_PRICE: 0,
  DISCOUNT_PERCENTAGE: 0,
  LOYALTY_POINTS: 0,
} as const;

// Database Constraints
export const DB_CONSTRAINTS = {
  MIN_PRODUCT_NAME_LENGTH: 1,
  MAX_PRODUCT_NAME_LENGTH: 255,
  MIN_PRICE: 0,
  MAX_PRICE: 999999.99,
  MIN_QUANTITY: 0,
  MAX_QUANTITY: 999999,
  MAX_DISCOUNT_PERCENTAGE: 100,
} as const;

// API Response Codes
export const HTTP_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Date Ranges (in days)
export const DATE_RANGES = {
  LAST_7_DAYS: 7,
  LAST_14_DAYS: 14,
  LAST_30_DAYS: 30,
  LAST_90_DAYS: 90,
  LAST_180_DAYS: 180,
  LAST_YEAR: 365,
} as const;

// Cache Duration (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Stock Thresholds
export const STOCK_THRESHOLDS = {
  LOW_STOCK_WARNING_DAYS: 7,
  EXPIRY_WARNING_DAYS: 30,
  EXPIRY_CRITICAL_DAYS: 7,
} as const;

export const PERMISSIONS = {
  // User Management
  "user:create": "Can create users",
  "user:read": "Can read users",
  "user:update": "Can update users",
  "user:delete": "Can delete users",

  // Product Management
  "product:create": "Can create products",
  "product:read": "Can read products",
  "product:update": "Can update products",
  "product:delete": "Can delete products",
  "product:view-cost": "Can view product cost",

  // Sales
  "sale:create": "Can create sales",
  "sale:read": "Can read sales",
  "sale:refund": "Can refund sales",
  "sale:view-profit": "Can view sale profit",

  // Reports
  "report:view": "Can view reports",
  "report:export": "Can export reports",

  // Settings
  "settings:manage": "Can manage settings",
  "settings:view": "Can view settings",

  // Stock Management
  "stock:adjust": "Can adjust stock",
  "stock:transfer": "Can transfer stock between batches",

  // Inventory
  "inventory:view": "Can view inventory",
  "inventory:export": "Can export inventory",
} as const;
