import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminFromCookies();
  if (!adminId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const { text, isCorrect } = await request.json();

  const updated = await prisma.option.update({
    where: { id: parseInt(id) },
    data: {
      ...(text !== undefined && { text }),
      ...(isCorrect !== undefined && { isCorrect }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminFromCookies();
  if (!adminId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.option.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
