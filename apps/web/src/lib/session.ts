import "server-only";
import { jwtVerify, decodeJwt } from "jose";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "taskhub_token";
// Non-httpOnly: expiry timestamp only (no secret data), readable by client JS
// to schedule the auto-signout timer.
export const EXPIRES_COOKIE = "taskhub_expires";

const encodedKey = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "super-secret-change-in-production",
);

export async function createSession(token: string) {
  const cookieStore = await cookies();
  const { exp } = decodeJwt(token);
  const expirySeconds =
    typeof exp === "number"
      ? exp
      : Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const maxAge = expirySeconds - Math.floor(Date.now() / 1000);

  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  // Expose only the expiry timestamp so the client can schedule auto-signout.
  cookieStore.set(EXPIRES_COOKIE, String(expirySeconds), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(EXPIRES_COOKIE);
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
