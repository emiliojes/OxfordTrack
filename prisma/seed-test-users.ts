import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import bcrypt from "bcryptjs";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const dbPath = path.resolve(__dirname, "../prisma/dev.db");
const url = tursoUrl ?? `file:${dbPath}`;
const adapter = new PrismaLibSql({ url, authToken: tursoToken });
const prisma = new PrismaClient({ adapter });

async function main() {
  const coordPassword = await bcrypt.hash("coord1234", 10);
  const teacherPassword = await bcrypt.hash("teacher2024", 10);

  const coord = await prisma.user.upsert({
    where: { email: "coordinator@school.edu" },
    update: { role: "COORDINATOR", status: "ACTIVE", password: coordPassword },
    create: {
      name: "Maria Lopez",
      email: "coordinator@school.edu",
      role: "COORDINATOR",
      status: "ACTIVE",
      password: coordPassword,
    },
  });
  console.log(`✓ Coordinator: ${coord.email}  /  coord1234`);

  const teacher = await prisma.user.upsert({
    where: { email: "carlos@school.edu" },
    update: { role: "TEACHER", status: "ACTIVE", password: teacherPassword },
    create: {
      name: "Carlos Ruiz",
      email: "carlos@school.edu",
      role: "TEACHER",
      status: "ACTIVE",
      password: teacherPassword,
      subjects: JSON.stringify(["Mathematics", "Physics"]),
    },
  });
  console.log(`✓ Teacher:      ${teacher.email}  /  teacher2024`);
  console.log(`  Subjects: Mathematics, Physics`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
