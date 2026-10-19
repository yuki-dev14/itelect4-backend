import { Router } from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth";
import Claim from "../models/Claim";
import Item from "../models/Item";
import type { ClaimInput } from "../types/index";

const router = Router();

router.use(auth);

router.get("/", async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimantId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(claims);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { itemId, claimantEmail, claimDetails } = req.body as Partial<ClaimInput>;
    if (
      typeof itemId !== "string" ||
      !mongoose.isValidObjectId(itemId) ||
      typeof claimantEmail !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(claimantEmail.trim()) ||
      typeof claimDetails !== "string" ||
      claimDetails.trim().length < 20
    ) {
      res.status(400).json({ message: "Select an item and provide a valid email and at least 20 characters of identification details" });
      return;
    }

    const item = await Item.findOneAndUpdate(
      { _id: itemId, status: "open" },
      { $set: { status: "claimed" } },
      { new: true },
    );
    if (!item) {
      res.status(409).json({ message: "This item is no longer available to claim" });
      return;
    }

    try {
      const claim = await Claim.create({
        itemId: item._id,
        claimantId: req.userId,
        claimantEmail: claimantEmail.trim().toLowerCase(),
        claimDetails: claimDetails.trim(),
      });
      res.status(201).json(claim);
    } catch (error) {
      await Item.updateOne({ _id: item._id, status: "claimed" }, { $set: { status: "open" } });
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

export default router;