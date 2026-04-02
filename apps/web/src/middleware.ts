import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const encodedKey = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "super-secret-change-in-production",
);

const PUBLIC_PATHS = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("taskhub_token")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic) {
    // Already logged in → redirect to dashboard
    if (token) {
      try {
        await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        // invalid token, let through
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
    response.cookies.delete("taskhub_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
