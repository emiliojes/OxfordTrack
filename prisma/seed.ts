import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "../prisma/dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@school.edu" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@school.edu",
      role: "ADMIN",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@school.edu" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "teacher@school.edu",
      role: "TEACHER",
    },
  });

  const eventsData = [
    {
      title: "Unit 3 Midterm Exam",
      subject: "Mathematics",
      date: "2026-05-10",
      time: "09:00",
      description: "Covers chapters 7–12: algebra, functions, and basic calculus.",
      published: true,
      createdBy: teacher.id,
    },
    {
      title: "Essay Submission — The Great Gatsby",
      subject: "English",
      date: "2026-05-15",
      time: "08:00",
      description: "2000-word analytical essay. Submit via the school portal.",
      published: true,
      createdBy: teacher.id,
    },
    {
      title: "Lab Practical Assessment",
      subject: "Chemistry",
      date: "2026-05-22",
      time: "14:00",
      description: "Titration and spectroscopy lab. Bring your lab notebook.",
      published: false,
      createdBy: teacher.id,
    },
  ];

  for (const ev of eventsData) {
    await prisma.event.create({ data: ev });
  }

  console.log("✅ Seed complete.");
  console.log(`   Admin: ${admin.email}`);
  console.log(`   Teacher: ${teacher.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
