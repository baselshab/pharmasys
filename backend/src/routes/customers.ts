import { Router, Request, Response } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { pharmacyId: "ph-001" },
      orderBy: { name: "asc" },
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { sales: true, debts: true },
    });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, phone, email, address, loyaltyPoints, creditLimit } = req.body;
    const customer = await prisma.customer.create({
      data: {
        id: `cust-${Date.now()}`,
        pharmacyId: "ph-001",
        name,
        phone,
        email,
        address,
        loyaltyPoints: loyaltyPoints || 0,
        creditLimit: creditLimit || 0,
      },
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to create customer" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to update customer" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

export default router;