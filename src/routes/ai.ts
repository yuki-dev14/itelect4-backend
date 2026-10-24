import { Router, type Request } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import auth from "../middleware/auth";
import { AiConfigurationError, AiReplyError, reviewProject } from "../ai/gemini";

const router = Router();
const aiRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, "Describe your project in at least 20 characters.")
    .max(2000, "Keep your project description to 2000 characters or fewer."),
});

const reviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    if (!req.userId) {
      throw new Error("Authentication middleware must run before the AI rate limiter");
    }
    return req.userId;
  },
  handler: (_req, res) => {
    res.status(429).json({
      message: "Five reviews a minute is the limit. Try again shortly.",
    });
  },
});

router.use(auth, reviewLimiter);

router.post("/", async (req, res) => {
  const parsed = aiRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues.map((issue) => issue.message),
    });
    return;
  }

  try {
    const review = await reviewProject(parsed.data.prompt);
    res.status(200).json(review);
  } catch (error) {
    if (error instanceof AiConfigurationError) {
      console.error("Gemini is not configured:", error.message);
      res.status(500).json({ message: "AI review is not configured." });
      return;
    }

    if (error instanceof AiReplyError) {
      console.error("Gemini returned an invalid review:", error.message);
      res.status(502).json({ message: "Gemini could not produce a valid review. Please try again." });
      return;
    }

    const status = getErrorStatus(error);
    console.error("Gemini request failed:", error);
    if (status === 429) {
      res.status(429).json({ message: "Gemini's request quota is temporarily exhausted. Try again shortly." });
      return;
    }
    res.status(502).json({ message: "The AI review service is temporarily unavailable." });
  }
});

function getErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }
  return undefined;
}

export default router;
