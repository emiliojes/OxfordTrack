import { createClient } from "@libsql/client";

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  await db.execute({
    sql: "UPDATE User SET role = 'ADMIN', status = 'ACTIVE' WHERE email = 'emiliojes@oxford.edu.pa'",
    args: [],
  });
  const result = await db.execute("SELECT email, role, status FROM User WHERE email = 'emiliojes@oxford.edu.pa'");
  console.table(result.rows);
  await db.close();
}

main();
