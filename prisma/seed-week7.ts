import { PrismaClient, EventType } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "../prisma/dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    console.error("No ADMIN user found. Run the main seed first.");
    process.exit(1);
  }

  const events = [
    // MONDAY Apr 13
    {
      title: "National Anthem led by Grade 10A – All Sections",
      subject: "Coordination",
      grade: 0,
      section: "GLOBAL",
      eventType: EventType.COORDINATION,
      date: "2026-04-13",
      time: "07:30",
      description: "National Anthem led by 10 grade A; all sections.",
      published: true,
    },
    {
      title: "English Week Activities",
      subject: "Coordination",
      grade: 0,
      section: "GLOBAL",
      eventType: EventType.COORDINATION,
      date: "2026-04-13",
      time: "08:00",
      description: "English Week activities – all sections.",
      published: true,
    },
    {
      title: "Educación Financiera Module 1 – Grade 11A & 11B",
      subject: "Coordination",
      grade: 0,
      section: "GLOBAL",
      eventType: EventType.COORDINATION,
      date: "2026-04-13",
      time: "07:30",
      description: "Educación Financiera Module 1 for 11A and B in their classrooms from 7:30–8:30 am.",
      published: true,
    },
    // TUESDAY Apr 14
    {
      title: "English Speaking Countries Presentation – Grades 10, 11 & 12",
      subject: "Coordination",
      grade: 0,
      section: "GLOBAL",
      eventType: EventType.COORDINATION,
      date: "2026-04-14",
      time: "13:15",
      description: "English Speaking Countries presented by Grades 10, 11 and 12 in the gym from 1:15–3:15.",
      published: true,
    },
    // WEDNESDAY Apr 15
    {
      title: "Expo Educate 12vo Grado – Hotel Galería",
      subject: "Coordination",
      grade: 0,
      section: "GLOBAL",
      eventType: EventType.COORDINATION,
      date: "2026-04-15",
      time: "08:30",
      description: "Expo Educate 12vo grado 8:30–10:00 at Hotel Galería.",
      published: true,
    },
    // THURSDAY Apr 16
    {
      title: "Happy Birthday Oxford School",
      subject: "Coordination",
      grade: 0,
      section: "GLOBAL",
      eventType: EventType.COORDINATION,
      date: "2026-04-16",
      time: "08:00",
      description: "Happy Birthday Oxford School.",
      published: true,
    },
    // FRIDAY Apr 17
    {
      title: "Charla de Alfabetización Constitucional – Grades 10, 11 & 12",
      subject: "Coordination",
      grade: 0,
      section: "GLOBAL",
      eventType: EventType.COORDINATION,
      date: "2026-04-17",
      time: "08:15",
      description: "Charla de Alfabetización Constitucional 8:15–9:15 para grados 10, 11 y 12.",
      published: true,
    },
    {
      title: "English Week Closing – Primary & Secondary",
      subject: "Coordination",
      grade: 0,
      section: "GLOBAL",
      eventType: EventType.COORDINATION,
      date: "2026-04-17",
      time: "10:30",
      description: "English week closing from 10:30–12:45 for primary and secondary sections.",
      published: true,
    },
  ];

  for (const ev of events) {
    await prisma.event.upsert({
      where: { id: `week7-${ev.date}-${ev.title.slice(0, 20).replace(/\s/g, "-")}` },
      update: {},
      create: {
        id: `week7-${ev.date}-${ev.title.slice(0, 20).replace(/\s/g, "-")}`,
        ...ev,
        createdBy: admin.id,
      },
    });
    console.log(`✓ ${ev.title}`);
  }

  // Also seed the coordination announcement
  await prisma.announcement.upsert({
    where: { id: "week7-announcement" },
    update: {},
    create: {
      id: "week7-announcement",
      title: "Week #7 Coordination Message",
      weekNumber: 7,
      body: `1. There is a drive called SECONDARY SECTION 2026 — go there and you will find the lesson per week for Core Project and general information. / Encontrarán un drive con el nombre SECONDARY SECTION 2026 contiene información general y las lecciones de Core Project.

2. Remember you support during break, lunch time and every Friday students departure.

3. Please when you schedule meetings with parents inform the coordination office.

4. Educación Financiera Module 1 for 11A and B in their classrooms from 7:30–8:30 am, Monday 13th.

Any other information, don't hesitate to ask me / Cualquier otra información por favor no duden en escribirme o pasar por mi oficina.

Have a great week! / ¡Pasen excelente semana!`,
      createdBy: admin.id,
    },
  });
  console.log("✓ Week #7 announcement posted");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
