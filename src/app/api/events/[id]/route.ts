import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { teacher: { select: { name: true, email: true } } },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (
    !event.published &&
    session.user.role === "STUDENT" &&
    event.createdBy !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(event);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const role = session?.user?.role ?? "";
  if (!session?.user || !["TEACHER", "COORDINATOR", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (event.createdBy !== session.user.id && !(["ADMIN"].includes(role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const newEventType = body.eventType ?? event.eventType;
  const isCoordination = newEventType === "COORDINATION";
  const newGrade = isCoordination ? 0 : (body.grade !== undefined ? Number(body.grade) : event.grade);
  const newSection = isCoordination ? "GLOBAL" : (newGrade <= 8 ? "MIDDLE" : "HIGH");
  const updated = await prisma.event.update({
    where: { id },
    data: {
      title: body.title ?? event.title,
      subject: body.subject ?? event.subject,
      grade: newGrade,
      section: newSection,
      eventType: newEventType,
      date: body.date ?? event.date,
      time: body.time ?? event.time,
      description: body.description !== undefined ? body.description : event.description,
      published: body.published !== undefined ? body.published : event.published,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const deleteRole = session?.user?.role ?? "";
  if (!session?.user || !["TEACHER", "COORDINATOR", "ADMIN"].includes(deleteRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (event.createdBy !== session.user.id && deleteRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
