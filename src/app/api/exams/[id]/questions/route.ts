import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminFromCookies();
  if (!adminId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const examId = parseInt(id);
  const { text, description } = await request.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "نص السؤال مطلوب" }, { status: 400 });
  }

  const count = await prisma.question.count({ where: { examId } });
  const question = await prisma.question.create({
    data: { examId, text: text.trim(), description: description?.trim() || "", orderNum: count },
  });
  return NextResponse.json(question, { status: 201 });
}
