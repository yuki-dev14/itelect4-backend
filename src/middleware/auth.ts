import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export default function auth(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.header("Authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload !== "object" || typeof payload.userId !== "string") {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}