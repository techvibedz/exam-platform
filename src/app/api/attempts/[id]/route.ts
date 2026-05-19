import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies, getUserFromCookies } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attemptId = parseInt(id);

  const user = await getUserFromCookies();
  const adminId = await getAdminFromCookies();

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      user: { select: { id: true, name: true } },
      answers: true,
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "المحاولة غير موجودة" }, { status: 404 });
  }

  if (!adminId && (!user || user.userId !== attempt.userId)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const exam = await prisma.exam.findUnique({
    where: { id: attempt.examId },
    include: {
      questions: {
        orderBy: { orderNum: "asc" },
        include: { options: true },
      },
    },
  });

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      score: attempt.score,
      total: attempt.total,
      user: attempt.user,
      completedAt: attempt.completedAt,
    },
    exam,
    userAnswers: attempt.answers,
  });
}
