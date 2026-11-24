import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Prisma 7 uses this URL for CLI database operations; keep migrations on Neon’s direct endpoint.
  // The fallback only allows schema validation and client generation without deployment credentials.
  datasource: { url: process.env.DIRECT_DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder?sslmode=require" },
});
