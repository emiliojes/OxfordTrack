import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "../prisma/dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const deleted = await prisma.event.deleteMany({
    where: { id: { startsWith: "week7-" } },
  });
  console.log(`Deleted ${deleted.count} week7 events`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
