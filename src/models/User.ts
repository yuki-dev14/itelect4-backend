import { Schema, model } from "mongoose";
import type { User } from "../types/index";

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, result) => {
        const transformed = result as Record<string, unknown>;
        transformed.id = String(transformed._id);
        delete transformed._id;
        delete transformed.__v;
        delete transformed.password;
      },
    },
  },
);

export default model<User>("User", userSchema);