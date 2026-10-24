import { GoogleGenAI } from "@google/genai";
import { MODEL, SYSTEM_PROMPT, buildContents } from "./prompt";
import {
  reviewSchema,
  reviewJsonSchema,
  type Review,
} from "../schemas/review";

let client: GoogleGenAI | null = null;

// Thrown when Gemini answered but the answer is unusable. The route
// turns it into a 502; anything else stays a 500.
export class AiReplyError extends Error {}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to .env, and to Vercel.",
    );
  }
  if (client === null) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export async function reviewProject(
  description: string,
): Promise<Review> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: buildContents(description),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      // JSON, in exactly this shape. Without these two lines the
      // reply is prose, and prose cannot be put on a screen field
      // by field.
      responseMimeType: "application/json",
      responseJsonSchema: reviewJsonSchema,
      // No temperature here, on purpose. Google's guide for the
      // Gemini 3 models says to leave it at its default of 1.0.
    },
  });

  const text = response.text;
  if (!text) {
    throw new AiReplyError("Gemini sent back no text");
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new AiReplyError("Gemini's reply was not JSON");
  }

  const result = reviewSchema.safeParse(data);
  if (!result.success) {
    throw new AiReplyError("Gemini's reply did not match the schema");
  }
  return result.data;
}
