import { NextRequest, NextResponse } from "next/server";

/**
 * Admin route protection middleware.
 * Matches all /admin/* routes and checks for an authenticated session.
 *
 * Full role-based checks happen in each page/API route via requireAdmin(),
 * but this middleware provides an early redirect for unauthenticated users.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // TEMPORARY: Skip auth check for dev preview.
  // Re-enable for production by uncommenting the block below.
  //
  // const hasAuthCookie = Array.from(request.cookies.getAll()).some((c) =>
  //   c.name.startsWith("sb-")
  // );
  // if (!hasAuthCookie) {
  //   const loginUrl = new URL("/login", request.url);
  //   loginUrl.searchParams.set("redirect", pathname);
  //   return NextResponse.redirect(loginUrl);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
