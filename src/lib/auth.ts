import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "exam-platform-admin-secret-key-change-me"
);

const USER_SECRET = new TextEncoder().encode(
  process.env.JWT_USER_SECRET || "exam-platform-user-secret-key-change-me"
);

export async function createAdminToken(adminId: number) {
  return new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(ADMIN_SECRET);
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, ADMIN_SECRET);
  return payload.adminId as number;
}

export async function getAdminFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}

export async function createUserToken(userId: number, name: string) {
  return new SignJWT({ userId, name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(USER_SECRET);
}

export async function verifyUserToken(token: string) {
  const { payload } = await jwtVerify(token, USER_SECRET);
  return { userId: payload.userId as number, name: payload.name as string };
}

export async function getUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_token")?.value;
  if (!token) return null;
  try {
    return await verifyUserToken(token);
  } catch {
    return null;
  }
}
