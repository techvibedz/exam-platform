import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromCookies } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUserFromCookies();

  if (!user) {
    return NextResponse.json({ existingAttempt: null });
  }

  const attempt = await prisma.attempt.findFirst({
    where: { examId: parseInt(id), userId: user.userId },
    orderBy: { completedAt: "desc" },
  });

  if (attempt) {
    return NextResponse.json({
      existingAttempt: { id: attempt.id, score: attempt.score, total: attempt.total },
    });
  }

  return NextResponse.json({ existingAttempt: null });
}
