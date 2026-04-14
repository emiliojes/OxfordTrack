import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  const isStaff = ["TEACHER", "COORDINATOR", "ADMIN"].includes(session.user.role ?? "");
  if (isStaff) {
    const events = all
      ? await prisma.event.findMany({
          orderBy: { date: "asc" },
          include: { teacher: { select: { name: true, email: true } } },
        })
      : await prisma.event.findMany({
          where: { createdBy: session.user.id },
          orderBy: { date: "asc" },
          include: { teacher: { select: { name: true, email: true } } },
        });
    return NextResponse.json(events);
  }

  const events = await prisma.event.findMany({
    where: { published: true },
    orderBy: { date: "asc" },
    include: { teacher: { select: { name: true, email: true } } },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const role = session?.user?.role ?? "";
  if (!session?.user || !["TEACHER", "COORDINATOR", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, subject, grade, eventType, date, time, description } = body;

  const isCoordination = eventType === "COORDINATION";
  const resolvedGrade = isCoordination ? 0 : Number(grade);
  const resolvedSection = isCoordination ? "GLOBAL" : (resolvedGrade <= 8 ? "MIDDLE" : "HIGH");
  const resolvedSubject = isCoordination ? (subject || "Coordination") : subject;

  if (!title || (!isCoordination && !grade) || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      title,
      subject: resolvedSubject,
      grade: resolvedGrade,
      section: resolvedSection,
      eventType: eventType ?? "SUMMATIVE",
      date,
      time,
      description: description || null,
      createdBy: session.user.id,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
