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
  // Find teachers/admin to assign events to
  const users = await prisma.user.findMany({
    where: { role: { in: ["TEACHER", "ADMIN", "COORDINATOR"] } },
  });
  if (users.length === 0) { console.error("No staff users found."); process.exit(1); }

  // Spread events across available teachers
  const t = (i: number) => users[i % users.length].id;

  const events = [
    // ── MONDAY Apr 21 ──
    { id: "demo-0421-1", grade: 6,  subject: "Mathematics",       eventType: EventType.SUMMATIVE, date: "2026-04-21", time: "08:00", title: "Grade 6 Mathematics – Summative",       description: "Chapters 4–5: Fractions and decimals.",       teacher: t(0) },
    { id: "demo-0421-2", grade: 8,  subject: "Science",           eventType: EventType.QUIZ,      date: "2026-04-21", time: "09:00", title: "Grade 8 Science – Quiz",                description: "Unit 3: Forces and motion.",                  teacher: t(1) },
    { id: "demo-0421-3", grade: 9,  subject: "English",           eventType: EventType.SUMMATIVE, date: "2026-04-21", time: "10:00", title: "Grade 9 English – Summative",            description: "Literary analysis essay.",                    teacher: t(0) },
    { id: "demo-0421-4", grade: 11, subject: "Chemistry",         eventType: EventType.EXAM,      date: "2026-04-21", time: "11:00", title: "Grade 11 Chemistry – Exam",              description: "Organic chemistry unit.",                     teacher: t(2) },
    { id: "demo-0421-5", grade: 12, subject: "Physics",           eventType: EventType.SUMMATIVE, date: "2026-04-21", time: "13:00", title: "Grade 12 Physics – Summative",           description: "Electromagnetism and circuits.",              teacher: t(1) },
    { id: "demo-0421-6", grade: 7,  subject: "History",           eventType: EventType.PROJECT,   date: "2026-04-21", time: "08:30", title: "Grade 7 History – Project",              description: "Panama history presentation.",                teacher: t(2) },

    // ── TUESDAY Apr 22 ──
    { id: "demo-0422-1", grade: 6,  subject: "English",           eventType: EventType.QUIZ,      date: "2026-04-22", time: "08:00", title: "Grade 6 English – Quiz",                description: "Vocabulary chapters 6–8.",                    teacher: t(0) },
    { id: "demo-0422-2", grade: 7,  subject: "Mathematics",       eventType: EventType.SUMMATIVE, date: "2026-04-22", time: "09:00", title: "Grade 7 Mathematics – Summative",        description: "Algebra: equations and inequalities.",        teacher: t(1) },
    { id: "demo-0422-3", grade: 9,  subject: "Biology",           eventType: EventType.SUMMATIVE, date: "2026-04-22", time: "10:00", title: "Grade 9 Biology – Summative",            description: "Cell division and genetics.",                 teacher: t(2) },
    { id: "demo-0422-4", grade: 10, subject: "Spanish",           eventType: EventType.EXAM,      date: "2026-04-22", time: "11:00", title: "Grade 10 Spanish – Exam",                description: "Literature: Modernismo period.",              teacher: t(0) },
    { id: "demo-0422-5", grade: 11, subject: "ICT",               eventType: EventType.PROJECT,   date: "2026-04-22", time: "13:00", title: "Grade 11 ICT – Project",                 description: "Database design project delivery.",           teacher: t(1) },
    { id: "demo-0422-6", grade: 12, subject: "Mathematics",       eventType: EventType.SUMMATIVE, date: "2026-04-22", time: "08:30", title: "Grade 12 Mathematics – Summative",       description: "Calculus: derivatives and integrals.",        teacher: t(2) },
    { id: "demo-0422-7", grade: 8,  subject: "Geography",         eventType: EventType.QUIZ,      date: "2026-04-22", time: "14:00", title: "Grade 8 Geography – Quiz",               description: "Latin America regions.",                      teacher: t(0) },

    // ── WEDNESDAY Apr 23 ──
    { id: "demo-0423-1", grade: 6,  subject: "Science",           eventType: EventType.SUMMATIVE, date: "2026-04-23", time: "08:00", title: "Grade 6 Science – Summative",            description: "Matter and its properties.",                  teacher: t(1) },
    { id: "demo-0423-2", grade: 7,  subject: "English",           eventType: EventType.SUMMATIVE, date: "2026-04-23", time: "09:00", title: "Grade 7 English – Summative",            description: "Short story writing assessment.",             teacher: t(0) },
    { id: "demo-0423-3", grade: 8,  subject: "Mathematics",       eventType: EventType.EXAM,      date: "2026-04-23", time: "10:00", title: "Grade 8 Mathematics – Exam",             description: "Geometry: area and volume.",                  teacher: t(2) },
    { id: "demo-0423-4", grade: 10, subject: "Physics",           eventType: EventType.SUMMATIVE, date: "2026-04-23", time: "11:00", title: "Grade 10 Physics – Summative",           description: "Kinematics and Newton's laws.",               teacher: t(1) },
    { id: "demo-0423-5", grade: 11, subject: "English",           eventType: EventType.PROJECT,   date: "2026-04-23", time: "13:00", title: "Grade 11 English – Project",             description: "Comparative literature project.",             teacher: t(0) },
    { id: "demo-0423-6", grade: 12, subject: "Biology",           eventType: EventType.SUMMATIVE, date: "2026-04-23", time: "08:30", title: "Grade 12 Biology – Summative",           description: "Genetics and biotechnology.",                 teacher: t(2) },
    { id: "demo-0423-7", grade: 9,  subject: "ICT",               eventType: EventType.QUIZ,      date: "2026-04-23", time: "14:00", title: "Grade 9 ICT – Quiz",                     description: "Spreadsheets and data analysis.",             teacher: t(1) },

    // ── THURSDAY Apr 24 ──
    { id: "demo-0424-1", grade: 6,  subject: "History",           eventType: EventType.QUIZ,      date: "2026-04-24", time: "08:00", title: "Grade 6 History – Quiz",                description: "Ancient civilizations.",                      teacher: t(2) },
    { id: "demo-0424-2", grade: 7,  subject: "Science",           eventType: EventType.SUMMATIVE, date: "2026-04-24", time: "09:00", title: "Grade 7 Science – Summative",            description: "Ecosystems and biodiversity.",                teacher: t(0) },
    { id: "demo-0424-3", grade: 9,  subject: "Mathematics",       eventType: EventType.SUMMATIVE, date: "2026-04-24", time: "10:00", title: "Grade 9 Mathematics – Summative",        description: "Quadratic equations and functions.",          teacher: t(1) },
    { id: "demo-0424-4", grade: 10, subject: "Chemistry",         eventType: EventType.EXAM,      date: "2026-04-24", time: "11:00", title: "Grade 10 Chemistry – Exam",              description: "Atomic structure and periodic table.",        teacher: t(2) },
    { id: "demo-0424-5", grade: 11, subject: "Mathematics",       eventType: EventType.SUMMATIVE, date: "2026-04-24", time: "13:00", title: "Grade 11 Mathematics – Summative",       description: "Trigonometry and complex numbers.",           teacher: t(0) },
    { id: "demo-0424-6", grade: 12, subject: "Spanish",           eventType: EventType.PROJECT,   date: "2026-04-24", time: "08:30", title: "Grade 12 Spanish – Project",             description: "Research paper: contemporary literature.",    teacher: t(1) },
    { id: "demo-0424-7", grade: 8,  subject: "English",           eventType: EventType.SUMMATIVE, date: "2026-04-24", time: "14:00", title: "Grade 8 English – Summative",            description: "Grammar and reading comprehension.",          teacher: t(2) },

    // ── FRIDAY Apr 25 ──
    { id: "demo-0425-1", grade: 6,  subject: "Mathematics",       eventType: EventType.QUIZ,      date: "2026-04-25", time: "08:00", title: "Grade 6 Mathematics – Quiz",             description: "Times tables and long division.",             teacher: t(0) },
    { id: "demo-0425-2", grade: 7,  subject: "ICT",               eventType: EventType.PROJECT,   date: "2026-04-25", time: "09:00", title: "Grade 7 ICT – Project",                  description: "Website design project delivery.",            teacher: t(1) },
    { id: "demo-0425-3", grade: 8,  subject: "History",           eventType: EventType.SUMMATIVE, date: "2026-04-25", time: "10:00", title: "Grade 8 History – Summative",            description: "World War II and its global impact.",         teacher: t(2) },
    { id: "demo-0425-4", grade: 10, subject: "Biology",           eventType: EventType.SUMMATIVE, date: "2026-04-25", time: "11:00", title: "Grade 10 Biology – Summative",           description: "Human body systems.",                         teacher: t(0) },
    { id: "demo-0425-5", grade: 11, subject: "Physics",           eventType: EventType.EXAM,      date: "2026-04-25", time: "13:00", title: "Grade 11 Physics – Exam",                description: "Thermodynamics and heat transfer.",           teacher: t(1) },
    { id: "demo-0425-6", grade: 12, subject: "ICT",               eventType: EventType.PROJECT,   date: "2026-04-25", time: "08:30", title: "Grade 12 ICT – Project",                 description: "Final capstone project presentation.",        teacher: t(2) },
    { id: "demo-0425-7", grade: 9,  subject: "Spanish",           eventType: EventType.SUMMATIVE, date: "2026-04-25", time: "14:00", title: "Grade 9 Spanish – Summative",            description: "Oral presentation and comprehension.",        teacher: t(0) },
  ];

  for (const ev of events) {
    await prisma.event.upsert({
      where: { id: ev.id },
      update: {},
      create: {
        id: ev.id,
        title: ev.title,
        subject: ev.subject,
        grade: ev.grade,
        section: ev.grade <= 8 ? "MIDDLE" : "HIGH",
        eventType: ev.eventType,
        date: ev.date,
        time: ev.time,
        description: ev.description,
        published: true,
        createdBy: ev.teacher,
      },
    });
    console.log(`✓ ${ev.title}`);
  }

  console.log(`\n✅ Seeded ${events.length} demo events for week Apr 21–25`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
