import { Router, Request, Response } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { pharmacyId: "ph-001" },
      orderBy: { name: "asc" },
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: { purchaseOrders: true },
    });
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch supplier" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, contactPerson, phone, email, address, paymentTerms } = req.body;
    const supplier = await prisma.supplier.create({
      data: {
        id: `sup-${Date.now()}`,
        pharmacyId: "ph-001",
        name,
        contactPerson,
        phone,
        email,
        address,
        paymentTerms,
      },
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: "Failed to create supplier" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: "Failed to update supplier" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.supplier.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete supplier" });
  }
});

export default router;