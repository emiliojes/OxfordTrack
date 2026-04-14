import { defineConfig } from "prisma/config";
import "dotenv/config";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

// Build connection URL: Turso needs token embedded for migrate commands
const dbUrl = tursoUrl
  ? `${tursoUrl}?authToken=${tursoToken}`
  : `file:${process.cwd()}/prisma/dev.db`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});
