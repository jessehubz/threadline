import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local since Prisma CLI doesn't do this automatically
dotenv.config({ path: path.join(__dirname, ".env.local") });
dotenv.config({ path: path.join(__dirname, ".env") });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || "",
  },
});
