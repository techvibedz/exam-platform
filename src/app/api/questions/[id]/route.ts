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
  const { text, orderNum } = await request.json();
  const question = await prisma.question.update({
    where: { id: parseInt(id) },
    data: {
      ...(text !== undefined && { text }),
      ...(orderNum !== undefined && { orderNum }),
    },
  });
  return NextResponse.json(question);
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
  await prisma.question.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
