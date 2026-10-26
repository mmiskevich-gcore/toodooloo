import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Vercel's Prisma Postgres integration prefixes its variables with the
    // project name. Not using env() here so `prisma generate` works without a URL.
    url: process.env.DATABASE_URL ?? process.env.toodooloo_DATABASE_URL,
  },
});
