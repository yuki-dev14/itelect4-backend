import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import type { LoginBody, RegisterBody } from "../types/index";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body as RegisterBody;
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });
    res.status(201).json(user);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as LoginBody;
    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      next(new Error("JWT_SECRET is not configured"));
      return;
    }

    const token = jwt.sign({ userId: user._id.toString() }, secret, { expiresIn: "7d" });
    res.status(200).json({ token, user });
  } catch (error) {
    next(error);
  }
});

export default router;