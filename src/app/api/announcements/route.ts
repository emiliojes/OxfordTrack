import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });
  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const role = session?.user?.role ?? "";
  if (!session?.user || !["COORDINATOR", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, body: bodyText, weekNumber } = body;

  if (!title || !bodyText) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      body: bodyText,
      weekNumber: weekNumber ? Number(weekNumber) : null,
      createdBy: session.user.id,
    },
  });

  return NextResponse.json(announcement, { status: 201 });
}
