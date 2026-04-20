import { createClient } from "@libsql/client";

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  const result = await db.execute("SELECT email, role, status FROM User");
  console.table(result.rows);
  await db.close();
}

main();
