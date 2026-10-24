import { z } from "zod";

// What a client is allowed to send to POST /api/ai. Checked before
// anything is sent to Gemini, because every request that reaches
// Gemini is counted against your free quota -- a request that was
// never going to work should cost nothing.
export const aiRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, "Describe your project in at least 20 characters.")
    .max(2000, "Keep the description under 2000 characters."),
});

export type AiRequest = z.infer<typeof aiRequestSchema>;

// What Gemini has to send BACK. This one schema is used three ways:
//   1. z.infer turns it into the Review type for TypeScript.
//   2. z.toJSONSchema turns it into the JSON Schema that is sent to Gemini.
//   3. reviewSchema.safeParse in src/ai/gemini.ts checks the reply.
export const reviewSchema = z.object({
  summary: z
    .string()
    .describe("One sentence restating what the student built."),
  strengths: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("What the description shows was done well."),
  improvements: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("Concrete things to fix or add before submitting."),
  readiness: z
    .enum(["ready", "almost", "not-yet"])
    .describe("How close the project is to being submitted."),
});

export type Review = z.infer<typeof reviewSchema>;

// Computed once, when this file is first imported -- not per request.
export const reviewJsonSchema = z.toJSONSchema(reviewSchema);
