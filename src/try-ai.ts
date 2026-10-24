import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import "dotenv/config";
import { reviewProject } from "./ai/gemini";

async function tryAi(): Promise<void> {
  const review = await reviewProject(
    "A campus lost and found app where students report items, browse listings, and submit claims. It uses React and TypeScript with an Express and MongoDB API.",
  );
  console.log(JSON.stringify(review, null, 2));
}

tryAi().catch((error: unknown) => {
  console.error("AI review request failed:", error);
  process.exitCode = 1;
});
