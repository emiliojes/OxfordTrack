import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const dbPath = path.resolve(__dirname, "../prisma/dev.db");
const url = tursoUrl ?? `file:${dbPath}`;
const adapter = new PrismaLibSql({ url, authToken: tursoToken });
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
