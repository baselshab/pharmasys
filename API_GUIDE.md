# PharmaSys API Guide

## Overview

Complete guide to using the PharmaSys Backend API with examples.

## Base Configuration

### Base URL

```
http://localhost:4000/api
```

### Required Headers

For all endpoints (except `/api/health`):

```
x-user-id: user-123
x-user-role: admin|pharmacist|cashier|manager
x-pharmacy-id: ph-001
Content-Type: application/json
```

### Response Format

```json
{
  "success": true,
  "data": {
    /* Response data */
  },
  "timestamp": "2026-04-12T10:30:00.000Z"
}
```

## Authentication & Headers

### Example: Curl with Headers

```bash
curl -X GET http://localhost:4000/api/products \
  -H "x-user-id: user-123" \
  -H "x-user-role: admin" \
  -H "x-pharmacy-id: ph-001" \
  -H "Content-Type: application/json"
```

### Example: JavaScript Fetch

```javascript
const headers = {
  "x-user-id": "user-123",
  "x-user-role": "admin",
  "x-pharmacy-id": "ph-001",
  "Content-Type": "application/json",
};

fetch("http://localhost:4000/api/products", {
  method: "GET",
  headers: headers,
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

### Example: Axios

```javascript
const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    "x-user-id": "user-123",
    "x-user-role": "admin",
    "x-pharmacy-id": "ph-001",
  },
});

axiosInstance.get("/products").then((res) => console.log(res.data));
```

## Products API

### List All Products

**Endpoint:** `GET /api/products`

**Response:**

```json
[
  {
    "id": "prod-123",
    "name": "Paracetamol 500mg",
    "genericName": "Acetaminophen",
    "barcode": "8901234560011",
    "unit": "strip",
    "sellPrice": 2.5,
    "costPrice": 1.2,
    "reorderLevel": 50,
    "maxStock": 1000,
    "isActive": true,
    "requiresPrescription": false,
    "category": {
      "id": "cat-analgesics",
      "name": "Analgesics & Antipyretics"
    },
    "batches": [
      {
        "id": "batch-123",
        "batchNumber": "BT-2025-001",
        "quantity": 200,
        "expiryDate": "2027-01-10T00:00:00.000Z"
      }
    ]
  }
]
```

### Get Single Product

**Endpoint:** `GET /api/products/:id`

**Example:**

```bash
GET /api/products/prod-001
```

### Create Product

**Endpoint:** `POST /api/products`

**Request Body:**

```json
{
  "name": "Aspirin 100mg",
  "genericName": "Acetylsalicylic Acid",
  "barcode": "8901234560035",
  "unit": "strip",
  "sellPrice": 3.5,
  "costPrice": 1.5,
  "reorderLevel": 30,
  "maxStock": 500,
  "requiresPrescription": false,
  "categoryId": "cat-analgesics"
}
```

**Response (201):**

```json
{
  "id": "prod-new-time-hash",
  "name": "Aspirin 100mg",
  "sellPrice": 3.5,
  "createdAt": "2026-04-12T10:30:00.000Z"
}
```

### Update Product

**Endpoint:** `PUT /api/products/:id`

**Request Body:**

```json
{
  "sellPrice": 4.0,
  "reorderLevel": 40
}
```

### Delete Product

**Endpoint:** `DELETE /api/products/:id`

**Response:** `204 No Content`

### Add Product Batch

**Endpoint:** `POST /api/products/:id/batch`

**Request Body:**

```json
{
  "batchNumber": "BT-2025-100",
  "quantity": 150,
  "costPrice": 1.5,
  "expiryDate": "2027-06-30",
  "supplierId": "sup-001"
}
```

## Categories API

### List Categories

```bash
GET /api/categories
```

**Response:**

```json
[
  {
    "id": "cat-analgesics",
    "name": "Analgesics & Antipyretics",
    "_count": { "products": 5 }
  }
]
```

### Create Category

```bash
POST /api/categories
```

**Request:**

```json
{
  "name": "Antibiotics",
  "parentId": null
}
```

## Customers API

### List Customers

```bash
GET /api/customers
```

### Create Customer

```bash
POST /api/customers
```

**Request:**

```json
{
  "name": "Ahmed Al-Rashid",
  "phone": "+966501234567",
  "email": "ahmed@example.com",
  "address": "Riyadh, Saudi Arabia",
  "loyaltyPoints": 0,
  "creditLimit": 1000
}
```

### Get Customer Details

```bash
GET /api/customers/:id
```

Returns customer with sales history and debts.

## Sales API

### List Sales

```bash
GET /api/sales
```

Returns last 100 sales.

### Create Sale

```bash
POST /api/sales
```

**Request:**

```json
{
  "customerId": "cust-001",
  "userId": "user-123",
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2,
      "batchId": "batch-001",
      "discount": 0
    },
    {
      "productId": "prod-002",
      "quantity": 1,
      "discount": 0
    }
  ],
  "paymentMethod": "cash",
  "discountAmount": 5,
  "taxAmount": 0,
  "notes": "Regular customer"
}
```

**Response (201):**

```json
{
  "id": "sale-123",
  "saleNumber": "S1712938400000",
  "customerId": "cust-001",
  "subtotal": 8.5,
  "discountAmount": 5,
  "totalAmount": 3.5,
  "paymentMethod": "cash",
  "amountPaid": 3.5,
  "items": [
    {
      "id": "si-123",
      "quantity": 2,
      "unitPrice": 2.5,
      "totalPrice": 5.0,
      "product": { "id": "prod-001", "name": "Paracetamol 500mg" }
    }
  ]
}
```

### Refund Sale

```bash
PUT /api/sales/:id/refund
```

Changes sale status to "refunded".

## Dashboard API

### Get Dashboard Stats

```bash
GET /api/dashboard/stats
```

**Response:**

```json
{
  "totalSales": 150,
  "totalRevenue": 3500.0,
  "totalCustomers": 85,
  "totalProducts": 45,
  "lowStockProducts": 8,
  "pendingOrders": 3
}
```

### Get Sales Metrics

```bash
GET /api/dashboard/sales-metrics
```

**Response:**

```json
{
  "dailySales": 15,
  "dailyRevenue": 425.5,
  "topProducts": [{ "productId": "prod-001", "_sum": { "quantity": 45 } }],
  "paymentMethods": {
    "cash": 350.0,
    "card": 75.5
  }
}
```

### Get Inventory Status

```bash
GET /api/dashboard/inventory
```

**Response:**

```json
{
  "totalValue": 2500,
  "lowStockItems": [
    { "id": "prod-005", "name": "Vitamin C", "reorderLevel": 25 }
  ],
  "expiredItems": []
}
```

## Products Advanced API

### Search Products

```bash
GET /api/products/search?query=paracetamol
```

Searches by name, generic name, or barcode.

### Get Products by Category

```bash
GET /api/products/category/:categoryId
```

Returns active products in category.

### Get Low Stock Products

```bash
GET /api/products/low-stock
```

Returns products below reorder level.

### Get Expired Products

```bash
GET /api/products/expired
```

Returns batches with past expiry dates.

### Adjust Stock

```bash
POST /api/products/:id/adjust-stock
```

**Request:**

```json
{
  "quantity": 50,
  "adjustmentType": "increase",
  "reason": "Stock correction",
  "batchId": "batch-001"
}
```

Valid types: `increase`, `decrease`, `damage`, `expired`, `correction`

### Get Stock Adjustment History

```bash
GET /api/products/:id/stock-history
```

Returns last 50 adjustments.

## Reports API

### Sales Report

```bash
GET /api/reports/sales?startDate=2026-01-01&endDate=2026-04-12
```

**Response:**

```json
{
  "sales": [
    /* array of sales */
  ],
  "summary": {
    "totalSales": 150,
    "totalRevenue": 5000.0,
    "averageTransaction": 33.33,
    "paymentMethods": {
      "cash": 3500.0,
      "card": 1500.0
    }
  }
}
```

### Customer Debts

```bash
GET /api/reports/customer-debts?status=unpaid
```

### Customer Purchase History

```bash
GET /api/customers/:customerId/purchase-history
```

**Response:**

```json
{
  "customer": {
    /* customer data */
  },
  "totalSpent": 5000.0,
  "totalDebt": 1500.0,
  "purchaseCount": 25
}
```

### Top Customers

```bash
GET /api/customers/top?limit=10
```

## Suppliers API

### List Suppliers

```bash
GET /api/suppliers
```

### Create Supplier

```bash
POST /api/suppliers
```

**Request:**

```json
{
  "name": "Global Pharma Supplies",
  "contactPerson": "John Smith",
  "phone": "+14155552671",
  "email": "sales@globalpharma.com",
  "address": "123 Business St",
  "paymentTerms": "30 days"
}
```

## Users API

### List Users

```bash
GET /api/users
```

### Create User

```bash
POST /api/users
```

**Request:**

```json
{
  "fullName": "Fatima Al-Ali",
  "email": "fatima@pharmacy.com",
  "phone": "+966501234567",
  "roles": ["pharmacist"]
}
```

### Update User

```bash
PUT /api/users/:id
```

**Request:**

```json
{
  "fullName": "Fatima Mohammed Al-Ali",
  "isActive": true
}
```

## Error Handling

### Error Codes

| Code | Meaning      | Example                  |
| ---- | ------------ | ------------------------ |
| 200  | Success      | GET request successful   |
| 201  | Created      | POST resource created    |
| 204  | No Content   | DELETE successful        |
| 400  | Bad Request  | Invalid data provided    |
| 401  | Unauthorized | Missing x-user-id header |
| 403  | Forbidden    | No permission for action |
| 404  | Not Found    | Resource doesn't exist   |
| 409  | Conflict     | Duplicate unique field   |
| 500  | Server Error | Internal error           |

### Error Response

```json
{
  "error": "Product not found"
}
```

## Pagination

Most list endpoints support pagination:

```bash
GET /api/sales?page=2&pageSize=50
```

## Filtering

Date range filtering:

```bash
GET /api/reports/sales?startDate=2026-01-01&endDate=2026-04-12
```

Status filtering:

```bash
GET /api/reports/customer-debts?status=unpaid
```

## Rate Limiting

Currently: No rate limiting (can be added).
Monitor: Check X-RateLimit-\* headers in responses.

## Webhooks

Currently: Not implemented (can be added).

## API Testing Tools

### Postman Collection

Import this into Postman:

1. Create new request
2. Use examples above
3. Set headers as specified
4. Send request

### CURL Examples

Complete curl examples provided in each section above.

### Browser Testing

For GET requests without headers:

```
http://localhost:4000/api/health
```

## Common Workflows

### Complete Sale

1. Get product: `GET /api/products/:id`
2. Get customer: `GET /api/customers/:id`
3. Create sale: `POST /api/sales`
4. View sale: `GET /api/sales/:id`

### Manage Inventory

1. Get low stock: `GET /api/products/low-stock`
2. Get expired: `GET /api/products/expired`
3. Adjust stock: `POST /api/products/:id/adjust-stock`
4. View history: `GET /api/products/:id/stock-history`

### Generate Reports

1. Sales report: `GET /api/reports/sales?date-range`
2. Customer debts: `GET /api/reports/customer-debts`
3. Inventory: `GET /api/dashboard/inventory`

## Rate Limits

- No enforced rate limits currently
- Recommend implementing after MVP

## Deprecation Policy

- Will provide 6 months notice before deprecating endpoints
- New endpoints will be added with versioning if needed

## Support

For API issues:

1. Check this guide
2. Verify headers are correct
3. Review error message
4. Check backend logs: `npm run dev` output

---

**Last Updated:** April 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
