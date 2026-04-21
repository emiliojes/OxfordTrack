import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.user || !["ADMIN", "COORDINATOR"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, subjects } = await req.json();
  if (!userId || !Array.isArray(subjects)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { subjects: subjects.length > 0 ? JSON.stringify(subjects) : null },
  });

  return NextResponse.json({ subjects: updated.subjects });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") ?? session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subjects: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = user.subjects ? JSON.parse(user.subjects) : null;
  return NextResponse.json({ subjects: parsed });
}
