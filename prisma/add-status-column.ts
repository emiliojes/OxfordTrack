import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  for (const sql of [
    "ALTER TABLE User ADD COLUMN status TEXT NOT NULL DEFAULT 'PENDING'",
    "ALTER TABLE User ADD COLUMN createdAt TEXT",
  ]) {
    try {
      await db.execute(sql);
      console.log(`✓ ${sql.slice(0, 60)}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("duplicate column") || msg.includes("already exists")) {
        console.log(`✓ Column already exists (skipped)`);
      } else {
        throw e;
      }
    }
  }

  await db.execute("UPDATE User SET status = 'ACTIVE'");
  await db.execute("UPDATE User SET createdAt = datetime('now') WHERE createdAt IS NULL");
  console.log("✓ Set all existing users to ACTIVE and backfilled createdAt");

  const result = await db.execute("SELECT id, email, status FROM User");
  console.log("Users:", result.rows);
}

main().catch(console.error).finally(() => db.close());
