import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: "الرجاء تسجيل الدخول اولا" }, { status: 401 });
  }

  const { id } = await params;
  const examId = parseInt(id);
  const { answers } = await request.json();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: "الاختبار غير موجود" }, { status: 404 });
  }

  let score = 0;
  const total = exam.questions.length;

  for (const q of exam.questions) {
    const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
    const userAnswer = answers?.find(
      (a: { questionId: number; optionIds: number[] }) => a.questionId === q.id
    );
    const userIds = (userAnswer?.optionIds || []).sort();
    const sortedCorrect = [...correctIds].sort();

    const isCorrect =
      correctIds.length > 0 &&
      userIds.length === sortedCorrect.length &&
      userIds.every((id: number, i: number) => id === sortedCorrect[i]);

    if (isCorrect) {
      score++;
    }
  }

  const attempt = await prisma.attempt.create({
    data: {
      userId: user.userId,
      examId,
      score,
      total,
      answers: {
        create: (answers || []).flatMap(
          (a: { questionId: number; optionIds: number[] }) =>
            (a.optionIds || []).map((oId: number) => ({
              questionId: a.questionId,
              optionId: oId,
            }))
        ),
      },
    },
    include: {
      answers: true,
    },
  });

  const examData = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        orderBy: { orderNum: "asc" },
        include: {
          options: true,
        },
      },
    },
  });

  return NextResponse.json({
    attempt: { id: attempt.id, score, total },
    exam: examData,
    userAnswers: attempt.answers,
  });
}
