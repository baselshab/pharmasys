import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { z } from "zod";

const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  genericName: z.string().optional(),
  barcode: z.string().optional(),
  unit: z.string().default("piece"),
  sellPrice: z.number().positive(),
  costPrice: z.number().default(0),
  reorderLevel: z.number().default(10),
  maxStock: z.number().default(1000),
  requiresPrescription: z.boolean().default(false),
  categoryId: z.string().optional(),
  pharmacyId: z.string().default("ph-001"),
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, batches: true },
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true, batches: true },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({
      data: {
        id: `prod-${Date.now()}`,
        ...data,
      },
      include: { category: true },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: "Invalid product data" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { category: true, batches: true },
    });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.post("/:id/batch", async (req: Request, res: Response) => {
  try {
    const { batchNumber, quantity, costPrice, expiryDate, supplierId } = req.body;
    const batch = await prisma.productBatch.create({
      data: {
        id: `batch-${Date.now()}`,
        productId: req.params.id,
        batchNumber,
        quantity,
        costPrice,
        expiryDate: new Date(expiryDate),
        supplierId,
      },
    });
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ error: "Failed to add batch" });
  }
});

router.get("/barcode/:barcode", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { barcode: req.params.barcode },
      include: {
        category: true,
        batches: {
          where: { quantity: { gt: 0 }, expiryDate: { gt: new Date() } },
          orderBy: { expiryDate: "asc" },
          take: 1,
        },
      },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product by barcode" });
  }
});

export default router;