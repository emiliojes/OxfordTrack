import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, currentPassword, newPassword } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const data: { name?: string; password?: string } = {};

  if (name && name.trim()) data.name = name.trim();

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "Current password required" }, { status: 400 });
    if (!user.password) return NextResponse.json({ error: "No password set — use Google sign-in" }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    if (newPassword.length < 6) return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    data.password = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.user.update({ where: { id: session.user.id }, data });
  return NextResponse.json({ name: updated.name, email: updated.email });
}
