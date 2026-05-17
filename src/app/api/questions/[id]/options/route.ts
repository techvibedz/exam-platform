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
  const questionId = parseInt(id);
  const { text, isCorrect } = await request.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "نص الخيار مطلوب" }, { status: 400 });
  }

  const option = await prisma.option.create({
    data: { questionId, text: text.trim(), isCorrect: !!isCorrect },
  });
  return NextResponse.json(option, { status: 201 });
}
