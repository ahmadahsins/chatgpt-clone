import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Check for better-auth session token cookie
  // The actual session validation happens server-side in the page
  const sessionToken = request.cookies.get("better-auth.session_token");

  // Redirect to home if no session token exists
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat"],
  // runtime: "edge", // Explicitly use Edge Runtime
};
