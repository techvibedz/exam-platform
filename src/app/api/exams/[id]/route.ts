import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id: parseInt(id) },
    include: {
      questions: {
        orderBy: { orderNum: "asc" },
        include: {
          options: { orderBy: { id: "asc" } },
        },
      },
      _count: { select: { attempts: true } },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: "الاختبار غير موجود" }, { status: 404 });
  }

  return NextResponse.json(exam);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminFromCookies();
  if (!adminId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const { title, description, isPublished } = await request.json();
  const exam = await prisma.exam.update({
    where: { id: parseInt(id) },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isPublished !== undefined && { isPublished }),
    },
  });
  return NextResponse.json(exam);
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
  await prisma.exam.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
