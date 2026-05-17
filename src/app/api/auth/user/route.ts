import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "الرجاء إدخال اسم صحيح" }, { status: 400 });
  }

  const trimmed = name.trim();

  let user = await prisma.user.findUnique({ where: { name: trimmed } });
  if (!user) {
    user = await prisma.user.create({ data: { name: trimmed } });
  }

  const token = await createUserToken(user.id, user.name);
  const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name } });
  response.cookies.set("user_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
