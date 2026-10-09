import { Router } from "express";
import auth from "../middleware/auth";
import Item from "../models/Item";

const router = Router();

router.use(auth);

router.get("/", async (req, res, next) => {
  try {
    const items = await Item.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const item = await Item.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.userId;
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true, runValidators: true },
    );
    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;