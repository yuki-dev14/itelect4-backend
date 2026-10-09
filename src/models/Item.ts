import { Schema, model } from "mongoose";
import type { Item } from "../types/index";

const itemSchema = new Schema<Item>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must be at most 100 characters"],
    },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: { values: ["lost", "found"], message: "Type must be lost or found" },
    },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: {
        values: ["open", "claimed", "returned"],
        message: "Status must be open, claimed, or returned",
      },
      default: "open",
    },
    reward: {
      type: Number,
      min: [0, "Reward cannot be negative"],
      max: [100000, "Reward cannot exceed 100000"],
      default: 0,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, result) => {
        const transformed = result as Record<string, unknown>;
        transformed.id = String(transformed._id);
        delete transformed._id;
        delete transformed.__v;
      },
    },
  },
);

export default model<Item>("Item", itemSchema);