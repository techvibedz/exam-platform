import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(request: NextRequest) {
  const adminId = await getAdminFromCookies();
  if (!adminId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!newPassword || newPassword.length < 4) {
    return NextResponse.json({ error: "كلمة المرور الجديدة قصيرة جدا" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, admin.password);
  if (!valid) {
    return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.admin.update({ where: { id: adminId }, data: { password: hash } });

  return NextResponse.json({ success: true });
}
