import { PrismaClient, EventType } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const dbPath = path.resolve(__dirname, "../prisma/dev.db");
const url = tursoUrl ?? `file:${dbPath}`;
const adapter = new PrismaLibSql({ url, authToken: tursoToken });
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
      title: "Grade 10 Mathematics – Exam",
      subject: "Mathematics",
      grade: 10,
      section: "HIGH",
      eventType: EventType.EXAM,
      date: "2026-05-10",
      time: "09:00",
      description: "Covers chapters 7–12: algebra, functions, and basic calculus.",
      published: true,
      createdBy: teacher.id,
    },
    {
      title: "Grade 11 English – Project",
      subject: "English",
      grade: 11,
      section: "HIGH",
      eventType: EventType.PROJECT,
      date: "2026-05-15",
      time: "08:00",
      description: "2000-word analytical essay. Submit via the school portal.",
      published: true,
      createdBy: teacher.id,
    },
    {
      title: "Grade 8 Science – Summative",
      subject: "Science",
      grade: 8,
      section: "MIDDLE",
      eventType: EventType.SUMMATIVE,
      date: "2026-05-22",
      time: "14:00",
      description: "Ecosystems and energy cycles.",
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
