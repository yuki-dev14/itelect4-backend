import { GoogleGenAI } from "@google/genai";
import { buildContents, MODEL, SYSTEM_PROMPT } from "./prompt";
import {
  reviewJsonSchema,
  reviewSchema,
  type Review,
} from "../schemas/review";

let client: GoogleGenAI | null = null;

export class AiConfigurationError extends Error {}
export class AiReplyError extends Error {}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiConfigurationError(
      "GEMINI_API_KEY is missing. Add it to .env and the backend deployment environment.",
    );
  }

  if (client === null) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export async function reviewProject(submission: string): Promise<Review> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: buildContents(submission),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: reviewJsonSchema,
    },
  });

  if (!response.text) {
    throw new AiReplyError("Gemini sent back no text");
  }

  let data: unknown;
  try {
    data = JSON.parse(response.text);
  } catch {
    throw new AiReplyError("Gemini's reply was not JSON");
  }

  const result = reviewSchema.safeParse(data);
  if (!result.success) {
    throw new AiReplyError("Gemini's reply did not match the review schema");
  }

  return result.data;
}
