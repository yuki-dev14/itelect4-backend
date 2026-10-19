import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import itemRoutes from "./routes/items";
import claimRoutes from "./routes/claims";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/", (_req, res) => {
  res.json({
    message: "API is running",
    endpoints: [
      "/api/health",
      "/api/auth/register",
      "/api/auth/login",
      "/api/items",
      "/api/claims"
    ]
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof mongoose.Error.ValidationError) {
    const firstError = Object.values(error.errors)[0];
    res.status(400).json({ message: firstError?.message ?? error.message });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(404).json({ message: "No item with that id" });
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  res.status(500).json({ message });
});

export default app;