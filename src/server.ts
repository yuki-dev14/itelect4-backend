import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";

const { MONGODB_URI, JWT_SECRET } = process.env;
if (!MONGODB_URI || !JWT_SECRET) {
  console.error("MONGODB_URI and JWT_SECRET must be set in the environment");
  process.exit(1);
}

const port = process.env.PORT || 4000;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
    app.listen(port, () => {
      console.log(`API on http://localhost:${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });