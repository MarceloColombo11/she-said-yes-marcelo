import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit não lê .env.local; variáveis já definidas no ambiente têm prioridade.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      process.env.NEON_DB_DATABASE_URL ??
      process.env.POSTGRES_URL ??
      "postgresql://localhost:5432/casamento_placeholder",
  },
});
