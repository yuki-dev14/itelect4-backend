import { Schema, model } from "mongoose";
import type { Claim } from "../types/index";

const claimSchema = new Schema<Claim>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true, index: true },
    claimantId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    claimantEmail: { type: String, required: true, trim: true, lowercase: true },
    claimDetails: { type: String, required: true, trim: true, minlength: 20 },
    status: {
      type: String,
      enum: { values: ["pending", "verified", "rejected"], message: "Invalid claim status" },
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, result) => {
        const transformed = result as Record<string, unknown>;
        transformed.id = String(transformed._id);
        transformed.itemId = String(transformed.itemId);
        transformed.claimantId = String(transformed.claimantId);
        delete transformed._id;
        delete transformed.__v;
      },
    },
  },
);

export default model<Claim>("Claim", claimSchema);