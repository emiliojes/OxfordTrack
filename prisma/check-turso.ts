import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("Tables in Turso DB:");
  result.rows.forEach((r) => console.log(" -", r.name));

  const cols = await db.execute("PRAGMA table_info('Event')");
  console.log("\nEvent columns:");
  cols.rows.forEach((r) => console.log(` - ${r.name} (${r.type})`));
}

main().catch(console.error).finally(() => db.close());
