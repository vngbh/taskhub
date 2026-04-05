import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const encodedKey = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "super-secret-change-in-production",
);

const TOKEN_COOKIE = "taskhub_token";
const EXPIRES_COOKIE = "taskhub_expires";
const PUBLIC_PATHS = ["/login", "/register"];

function clearSessionCookies(response: NextResponse) {
  response.cookies.delete(TOKEN_COOKIE);
  response.cookies.delete(EXPIRES_COOKIE);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic) {
    if (token) {
      try {
        await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        // Expired / invalid token — clear stale cookies then let through
        const response = NextResponse.next();
        clearSessionCookies(response);
        return response;
      }
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    clearSessionCookies(response);
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
