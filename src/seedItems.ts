import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import Item from "./models/Item";
import { INITIAL_ITEMS } from "./data/initialItems";

async function seedItems() {
  await connectDB();

  for (const item of INITIAL_ITEMS) {
    const { reportedAt, ...fields } = item;
    await Item.updateOne(
      { title: item.title },
      {
        $setOnInsert: {
          ...fields,
          category: "Other",
          reward: 0,
          status: "open",
          createdAt: new Date(reportedAt),
        },
      },
      { upsert: true },
    );
  }

  console.log(`${INITIAL_ITEMS.length} sample items available in ${mongoose.connection.name}`);
  await mongoose.disconnect();
}

seedItems().catch(async (error: unknown) => {
  console.error("Item seed failed:", error);
  await mongoose.disconnect();
  process.exitCode = 1;
});