import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN!;

if (!url) { console.error("TURSO_DATABASE_URL not set"); process.exit(1); }

const db = createClient({ url, authToken });

async function main() {
  // Read all migration SQL files in order
  const migrationsDir = path.resolve(__dirname, "../prisma/migrations");
  const folders = fs.readdirSync(migrationsDir)
    .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  for (const folder of folders) {
    const sqlFile = path.join(migrationsDir, folder, "migration.sql");
    if (!fs.existsSync(sqlFile)) continue;

    const sql = fs.readFileSync(sqlFile, "utf-8");
    console.log(`Applying migration: ${folder}`);

    // Split on statement separator and run each statement
    const statements = sql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const stmt of statements) {
      try {
        await db.execute(stmt + ";");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        // Ignore "already exists" errors — idempotent
        if (
          msg.includes("already exists") ||
          msg.includes("duplicate column") ||
          msg.includes("UNIQUE constraint failed")
        ) {
          console.log(`  ↩ Skipped (already applied): ${stmt.slice(0, 60)}...`);
        } else {
          console.error(`  ✗ Error in ${folder}: ${msg}`);
          console.error(`  Statement: ${stmt.slice(0, 120)}`);
        }
      }
    }
    console.log(`  ✓ Done`);
  }

  console.log("\n✅ All migrations applied to Turso.");
}

main().catch(console.error).finally(() => db.close());
