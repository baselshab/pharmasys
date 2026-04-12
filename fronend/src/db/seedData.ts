import type { Database } from "sql.js";
import { saveDatabase } from "./sqlite";

const PHARMACY_ID = "ph-001";

export function seedIfEmpty(db: Database): void {
  const result = db.exec("SELECT COUNT(*) as c FROM products");
  const count = result[0]?.values[0]?.[0] as number;
  if (count > 0) return;

  console.log("🌱 Seeding sample data...");

  // Categories
  const categories = [
    ["cat-analgesics", "Analgesics & Antipyretics"],
    ["cat-antibiotics", "Antibiotics"],
    ["cat-vitamins", "Vitamins & Supplements"],
    ["cat-otc", "OTC & Personal Care"],
    ["cat-chronic", "Chronic Care"],
    ["cat-gastrointestinal", "Gastrointestinal"],
  ];
  for (const [id, name] of categories) {
    db.run("INSERT INTO categories (id, name) VALUES (?, ?)", [id, name]);
  }

  // Products
  const products: Array<[string, string, string, string | null, string, string, number, number, number, number]> = [
    ["p-001", "cat-analgesics", "Paracetamol 500mg", "Acetaminophen", "8901234560011", "strip", 2.50, 1.20, 50, 0],
    ["p-002", "cat-analgesics", "Ibuprofen 400mg", "Ibuprofen", "8901234560028", "strip", 3.80, 1.90, 30, 0],
    ["p-003", "cat-antibiotics", "Amoxicillin 500mg", "Amoxicillin", "8901234560035", "strip", 8.50, 4.50, 20, 1],
    ["p-004", "cat-antibiotics", "Azithromycin 250mg", "Azithromycin", "8901234560042", "strip", 12.00, 6.80, 15, 1],
    ["p-005", "cat-vitamins", "Vitamin C 1000mg", null, "8901234560059", "bottle", 6.50, 3.20, 25, 0],
    ["p-006", "cat-vitamins", "Vitamin D3 2000IU", null, "8901234560066", "bottle", 9.00, 4.80, 20, 0],
    ["p-007", "cat-vitamins", "Multivitamin Daily", null, "8901234560073", "bottle", 12.00, 6.50, 15, 0],
    ["p-008", "cat-otc", "Cetirizine 10mg", "Cetirizine", "8901234560080", "strip", 1.80, 0.60, 40, 0],
    ["p-009", "cat-otc", "Cough Syrup 100ml", "Dextromethorphan", "8901234560097", "bottle", 5.50, 2.80, 20, 0],
    ["p-010", "cat-otc", "Antiseptic Solution 100ml", null, "8901234560103", "bottle", 3.50, 1.50, 25, 0],
    ["p-011", "cat-chronic", "Metformin 500mg", "Metformin", "8901234560110", "strip", 4.00, 1.80, 30, 1],
    ["p-012", "cat-chronic", "Amlodipine 5mg", "Amlodipine", "8901234560127", "strip", 5.50, 2.50, 25, 1],
    ["p-013", "cat-gastrointestinal", "Omeprazole 20mg", "Omeprazole", "8901234560134", "strip", 6.00, 2.80, 20, 0],
    ["p-014", "cat-gastrointestinal", "ORS Sachets", null, "8901234560141", "piece", 0.80, 0.30, 60, 0],
    ["p-015", "cat-otc", "Hand Sanitizer 250ml", null, "8901234560158", "bottle", 4.50, 2.00, 30, 0],
  ];

  for (const [id, catId, name, generic, barcode, unit, sell, cost, reorder, rx] of products) {
    db.run(
      `INSERT INTO products (id, pharmacy_id, category_id, name, generic_name, barcode, unit, sell_price, cost_price, reorder_level, requires_prescription)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, PHARMACY_ID, catId, name, generic, barcode, unit, sell, cost, reorder, rx]
    );
  }

  // Batches — FEFO order matters
  const batches: Array<[string, string, string, number, number, string, string]> = [
    ["b-001", "p-001", "BT-2025-001", 200, 1.20, "2025-01-10", "2027-01-10"],
    ["b-002", "p-002", "BT-2025-002", 120, 1.90, "2025-02-15", "2027-02-15"],
    ["b-003", "p-003", "BT-2025-003", 80, 4.50, "2025-03-01", "2026-09-01"],
    ["b-004", "p-004", "BT-2025-004", 50, 6.80, "2025-01-20", "2026-07-20"],
    ["b-005", "p-005", "BT-2025-005", 90, 3.20, "2025-04-01", "2027-04-01"],
    ["b-006", "p-006", "BT-2025-006", 70, 4.80, "2025-03-15", "2027-03-15"],
    ["b-007", "p-007", "BT-2025-007", 60, 6.50, "2025-02-01", "2027-02-01"],
    ["b-008", "p-008", "BT-2025-008", 150, 0.60, "2025-05-01", "2027-05-01"],
    ["b-009", "p-009", "BT-2025-009", 80, 2.80, "2025-01-15", "2026-12-15"],
    ["b-010", "p-010", "BT-2025-010", 100, 1.50, "2025-06-01", "2027-06-01"],
    ["b-011", "p-011", "BT-2025-011", 110, 1.80, "2025-04-10", "2027-04-10"],
    ["b-012", "p-012", "BT-2025-012", 90, 2.50, "2025-03-20", "2027-03-20"],
    ["b-013", "p-013", "BT-2025-013", 75, 2.80, "2025-05-15", "2027-05-15"],
    ["b-014", "p-014", "BT-2025-014", 300, 0.30, "2025-06-01", "2027-12-01"],
    ["b-015", "p-015", "BT-2025-015", 120, 2.00, "2025-07-01", "2027-07-01"],
  ];

  for (const [id, prodId, batch, qty, cost, mfg, exp] of batches) {
    db.run(
      `INSERT INTO product_batches (id, product_id, batch_number, quantity, cost_price, manufacture_date, expiry_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, prodId, batch, qty, cost, mfg, exp]
    );
  }

  saveDatabase(db);
  console.log("✅ Seed data loaded");
}
