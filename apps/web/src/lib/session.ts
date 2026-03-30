import "server-only";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "taskhub_token";
const encodedKey = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "super-secret-change-in-production",
);

export async function createSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  try {
    await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return token;
  } catch {
    return null;
  }
}
