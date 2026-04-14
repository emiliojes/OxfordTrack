import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const users = await db.execute("SELECT id, email, role FROM User");
  console.log("Users:", users.rows);

  const events = await db.execute("SELECT id, title, createdBy FROM Event LIMIT 5");
  console.log("Events sample:", events.rows);

  const count = await db.execute("SELECT COUNT(*) as total FROM Event");
  console.log("Total events:", count.rows[0].total);
}

main().catch(console.error).finally(() => db.close());
