import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check for better-auth session token cookie
  const sessionToken = request.cookies.get("better-auth.session_token");

  // Redirect to login if no session token exists
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chat/:path*",
    "/((?!api/auth|login|signup|_next/static|_next/image|favicon.ico).*)",
  ],
};
