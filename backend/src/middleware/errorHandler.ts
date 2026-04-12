import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";

export const errorHandler = (
  err: Error,
  _req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    if ((err as any).code === "P2025") {
      return res.status(404).json({ error: "Resource not found" });
    }
    if ((err as any).code === "P2002") {
      return res.status(409).json({ error: "Unique constraint violated" });
    }
  }

  // Handle validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Validation failed", details: err.message });
  }

  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
};

export const notFoundHandler = (_req: AuthRequest, res: Response) => {
  res.status(404).json({ error: "Route not found" });
};

export const requestLogger = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};
