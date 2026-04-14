import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(__dirname, "../prisma/dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin1234", 12);
  const teacherPassword = await bcrypt.hash("teacher1234", 12);

  await prisma.user.update({
    where: { email: "admin@school.edu" },
    data: { password: adminPassword },
  });

  await prisma.user.update({
    where: { email: "teacher@school.edu" },
    data: { password: teacherPassword },
  });

  console.log("✅ Passwords set:");
  console.log("   admin@school.edu     → admin1234   (role: ADMIN)");
  console.log("   teacher@school.edu   → teacher1234 (role: TEACHER)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
