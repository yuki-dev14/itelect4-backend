import type { Types } from "mongoose";

export type ItemType = "lost" | "found";
export type ItemStatus = "open" | "claimed" | "returned";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  type: ItemType;
  category: string;
  location: string;
  status: ItemStatus;
  reward: number;
  userId?: string | Types.ObjectId;
  createdAt: Date;
}

export type ClaimStatus = "pending" | "verified" | "rejected";

export interface Claim {
  id: string;
  itemId: string | Types.ObjectId;
  claimantId: string | Types.ObjectId;
  claimantEmail: string;
  claimDetails: string;
  status: ClaimStatus;
  createdAt: Date;
}

export type RegisterBody = Pick<User, "name" | "email" | "password">;
export type LoginBody = Pick<User, "email" | "password">;
export type ItemInput = Omit<Item, "id" | "userId" | "createdAt">;
export type ClaimInput = Pick<Claim, "itemId" | "claimantEmail" | "claimDetails">;