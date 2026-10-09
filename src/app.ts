import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import itemRoutes from "./routes/items";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

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