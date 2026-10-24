import { Type } from "@google/genai";
import { z } from "zod";

export const reviewSchema = z.object({
  summary: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1).max(3),
  improvements: z.array(z.string().min(1)).min(1).max(3),
  readiness: z.enum(["ready", "almost", "not-yet"]),
});

export type Review = z.infer<typeof reviewSchema>;

export const reviewJsonSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
    readiness: {
      type: Type.STRING,
      enum: ["ready", "almost", "not-yet"],
    },
  },
  required: ["summary", "strengths", "improvements", "readiness"],
  propertyOrdering: ["summary", "strengths", "improvements", "readiness"],
};
