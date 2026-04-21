import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import path from "path";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const dbPath = path.resolve(__dirname, "../prisma/dev.db");
const url = tursoUrl ?? `file:${dbPath}`;

const client = createClient({ url, authToken: tursoToken });

async function main() {
  try {
    await client.execute(`ALTER TABLE "User" ADD COLUMN "subjects" TEXT`);
    console.log("✅ Added subjects column to User table");
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("duplicate column")) {
      console.log("ℹ️  subjects column already exists, skipping");
    } else {
      throw e;
    }
  }
}

main()
  .catch(console.error)
  .finally(() => client.close());
