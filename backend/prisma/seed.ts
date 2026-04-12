import { prisma } from "../src/db.js";

const PHARMACY_ID = "ph-001";

async function main() {
  const existingCategories = await prisma.category.count();
  if (existingCategories > 0) {
    console.log("Database already seeded");
    return;
  }

  console.log("🌱 Seeding sample data...");

  // Pharmacy
  await prisma.pharmacy.upsert({
    where: { id: PHARMACY_ID },
    update: {},
    create: {
      id: PHARMACY_ID,
      name: "PharmaSys Pharmacy",
      address: "Main Location",
    },
  });

  // Categories
  const categories = [
    { id: "cat-analgesics", name: "Analgesics & Antipyretics" },
    { id: "cat-antibiotics", name: "Antibiotics" },
    { id: "cat-vitamins", name: "Vitamins & Supplements" },
    { id: "cat-otc", name: "OTC & Personal Care" },
    { id: "cat-chronic", name: "Chronic Care" },
    { id: "cat-gastrointestinal", name: "Gastrointestinal" },
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }

  // Products
  const products = [
    { id: "p-001", categoryId: "cat-analgesics", name: "Paracetamol 500mg", genericName: "Acetaminophen", barcode: "8901234560011", unit: "strip", sellPrice: 2.50, costPrice: 1.20, reorderLevel: 50, requiresPrescription: false },
    { id: "p-002", categoryId: "cat-analgesics", name: "Ibuprofen 400mg", genericName: "Ibuprofen", barcode: "8901234560028", unit: "strip", sellPrice: 3.80, costPrice: 1.90, reorderLevel: 30, requiresPrescription: false },
    { id: "p-003", categoryId: "cat-antibiotics", name: "Amoxicillin 500mg", genericName: "Amoxicillin", barcode: "8901234560035", unit: "strip", sellPrice: 8.50, costPrice: 4.50, reorderLevel: 20, requiresPrescription: true },
    { id: "p-004", categoryId: "cat-antibiotics", name: "Azithromycin 250mg", genericName: "Azithromycin", barcode: "8901234560042", unit: "strip", sellPrice: 12.00, costPrice: 6.80, reorderLevel: 15, requiresPrescription: true },
    { id: "p-005", categoryId: "cat-vitamins", name: "Vitamin C 1000mg", barcode: "8901234560059", unit: "bottle", sellPrice: 6.50, costPrice: 3.20, reorderLevel: 25, requiresPrescription: false },
    { id: "p-006", categoryId: "cat-vitamins", name: "Vitamin D3 2000IU", barcode: "8901234560066", unit: "bottle", sellPrice: 9.00, costPrice: 4.80, reorderLevel: 20, requiresPrescription: false },
    { id: "p-007", categoryId: "cat-vitamins", name: "Multivitamin Daily", barcode: "8901234560073", unit: "bottle", sellPrice: 12.00, costPrice: 6.50, reorderLevel: 15, requiresPrescription: false },
    { id: "p-008", categoryId: "cat-otc", name: "Cetirizine 10mg", genericName: "Cetirizine", barcode: "8901234560080", unit: "strip", sellPrice: 1.80, costPrice: 0.60, reorderLevel: 40, requiresPrescription: false },
    { id: "p-009", categoryId: "cat-otc", name: "Cough Syrup 100ml", genericName: "Dextromethorphan", barcode: "8901234560097", unit: "bottle", sellPrice: 5.50, costPrice: 2.80, reorderLevel: 20, requiresPrescription: false },
    { id: "p-010", categoryId: "cat-otc", name: "Antiseptic Solution 100ml", barcode: "8901234560103", unit: "bottle", sellPrice: 3.50, costPrice: 1.50, reorderLevel: 25, requiresPrescription: false },
    { id: "p-011", categoryId: "cat-chronic", name: "Metformin 500mg", genericName: "Metformin", barcode: "8901234560110", unit: "strip", sellPrice: 4.00, costPrice: 1.80, reorderLevel: 30, requiresPrescription: true },
    { id: "p-012", categoryId: "cat-chronic", name: "Amlodipine 5mg", genericName: "Amlodipine", barcode: "8901234560127", unit: "strip", sellPrice: 5.50, costPrice: 2.50, reorderLevel: 25, requiresPrescription: true },
    { id: "p-013", categoryId: "cat-gastrointestinal", name: "Omeprazole 20mg", genericName: "Omeprazole", barcode: "8901234560134", unit: "strip", sellPrice: 6.00, costPrice: 2.80, reorderLevel: 20, requiresPrescription: false },
    { id: "p-014", categoryId: "cat-gastrointestinal", name: "ORS Sachets", barcode: "8901234560141", unit: "piece", sellPrice: 0.80, costPrice: 0.30, reorderLevel: 60, requiresPrescription: false },
    { id: "p-015", categoryId: "cat-otc", name: "Hand Sanitizer 250ml", barcode: "8901234560158", unit: "bottle", sellPrice: 4.50, costPrice: 2.00, reorderLevel: 30, requiresPrescription: false },
  ];

  for (const prod of products) {
    await prisma.product.create({
      data: { ...prod, pharmacyId: PHARMACY_ID },
    });
  }

  // Batches
  const batches = [
    { id: "b-001", productId: "p-001", batchNumber: "BT-2025-001", quantity: 200, costPrice: 1.20, manufactureDate: new Date("2025-01-10"), expiryDate: new Date("2027-01-10") },
    { id: "b-002", productId: "p-002", batchNumber: "BT-2025-002", quantity: 120, costPrice: 1.90, manufactureDate: new Date("2025-02-15"), expiryDate: new Date("2027-02-15") },
    { id: "b-003", productId: "p-003", batchNumber: "BT-2025-003", quantity: 80, costPrice: 4.50, manufactureDate: new Date("2025-03-01"), expiryDate: new Date("2026-09-01") },
    { id: "b-004", productId: "p-004", batchNumber: "BT-2025-004", quantity: 50, costPrice: 6.80, manufactureDate: new Date("2025-01-20"), expiryDate: new Date("2026-07-20") },
    { id: "b-005", productId: "p-005", batchNumber: "BT-2025-005", quantity: 90, costPrice: 3.20, manufactureDate: new Date("2025-04-01"), expiryDate: new Date("2027-04-01") },
    { id: "b-006", productId: "p-006", batchNumber: "BT-2025-006", quantity: 70, costPrice: 4.80, manufactureDate: new Date("2025-03-15"), expiryDate: new Date("2027-03-15") },
    { id: "b-007", productId: "p-007", batchNumber: "BT-2025-007", quantity: 60, costPrice: 6.50, manufactureDate: new Date("2025-02-01"), expiryDate: new Date("2027-02-01") },
    { id: "b-008", productId: "p-008", batchNumber: "BT-2025-008", quantity: 150, costPrice: 0.60, manufactureDate: new Date("2025-05-01"), expiryDate: new Date("2027-05-01") },
    { id: "b-009", productId: "p-009", batchNumber: "BT-2025-009", quantity: 80, costPrice: 2.80, manufactureDate: new Date("2025-01-15"), expiryDate: new Date("2026-12-15") },
    { id: "b-010", productId: "p-010", batchNumber: "BT-2025-010", quantity: 100, costPrice: 1.50, manufactureDate: new Date("2025-06-01"), expiryDate: new Date("2027-06-01") },
    { id: "b-011", productId: "p-011", batchNumber: "BT-2025-011", quantity: 110, costPrice: 1.80, manufactureDate: new Date("2025-04-10"), expiryDate: new Date("2027-04-10") },
    { id: "b-012", productId: "p-012", batchNumber: "BT-2025-012", quantity: 90, costPrice: 2.50, manufactureDate: new Date("2025-03-20"), expiryDate: new Date("2027-03-20") },
    { id: "b-013", productId: "p-013", batchNumber: "BT-2025-013", quantity: 75, costPrice: 2.80, manufactureDate: new Date("2025-05-15"), expiryDate: new Date("2027-05-15") },
    { id: "b-014", productId: "p-014", batchNumber: "BT-2025-014", quantity: 300, costPrice: 0.30, manufactureDate: new Date("2025-06-01"), expiryDate: new Date("2027-12-01") },
    { id: "b-015", productId: "p-015", batchNumber: "BT-2025-015", quantity: 120, costPrice: 2.00, manufactureDate: new Date("2025-07-01"), expiryDate: new Date("2027-07-01") },
  ];

  for (const batch of batches) {
    await prisma.productBatch.create({ data: batch });
  }

  // Default branch
  await prisma.branch.upsert({
    where: { id: "branch-main" },
    update: {},
    create: {
      id: "branch-main",
      pharmacyId: PHARMACY_ID,
      name: "Main Branch",
      address: "Main Location",
    },
  });

  // Sync meta
  await prisma.syncMeta.upsert({
    where: { key: "schema_version" },
    update: {},
    create: { key: "schema_version", value: "4" },
  });

  console.log("✅ Seed data loaded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());