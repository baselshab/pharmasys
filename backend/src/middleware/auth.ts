import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Extract from header or query
    const userId = req.headers["x-user-id"] as string || req.query.userId as string;
    const role = req.headers["x-user-role"] as string || "user";
    const pharmacyId = req.headers["x-pharmacy-id"] as string || "ph-001";

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: missing user ID" });
    }

    req.userId = userId;
    req.role = role;
    req.pharmacyId = pharmacyId;

    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient permissions" });
    }
    next();
  };
};

export const validatePharmacy = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.pharmacyId) {
    return res.status(400).json({ error: "Missing pharmacy ID" });
  }
  next();
};
