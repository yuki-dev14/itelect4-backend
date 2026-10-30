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

  if (!token) {
    res.status(401).json({ message: "No token. Send Authorization: Bearer <token>" });
    return;
  }

  if (!secret) {
    res.status(401).json({ message: "Token is invalid or has expired" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload !== "object" || typeof payload.userId !== "string") {
      res.status(401).json({ message: "Token is invalid or has expired" });
      return;
    }

    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: "Token is invalid or has expired" });
  }
}

export const requireAuth = auth;
