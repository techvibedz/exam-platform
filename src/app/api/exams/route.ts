import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookies } from "@/lib/auth";

export async function GET() {
  const exams = await prisma.exam.findMany({
    where: { isPublished: true },
    include: {
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(exams);
}

export async function POST(request: NextRequest) {
  const adminId = await getAdminFromCookies();
  if (!adminId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { title, description } = await request.json();
  const exam = await prisma.exam.create({
    data: { title, description: description || "" },
  });
  return NextResponse.json(exam, { status: 201 });
}
