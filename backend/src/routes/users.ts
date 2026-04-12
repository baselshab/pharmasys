import { Router, Request, Response } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { pharmacyId: "ph-001" },
      orderBy: { fullName: "asc" },
      include: { userRoles: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { userRoles: true, branchUsers: true },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, roles } = req.body;
    
    const user = await prisma.user.create({
      data: {
        id: `user-${Date.now()}`,
        pharmacyId: "ph-001",
        fullName,
        email,
        phone,
        userRoles: {
          create: (roles || ["cashier"]).map((role: string) => ({
            id: `ur-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            role,
          })),
        },
      },
      include: { userRoles: true },
    });
    
    res.status(201).json(user);
  } catch (error) {
    console.error("User error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { fullName, phone, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { fullName, phone, isActive },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

export default router;