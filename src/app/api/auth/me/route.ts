import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/auth";

export async function GET() {
  const adminId = await getAdminFromCookies();
  return NextResponse.json({ authenticated: !!adminId });
}
