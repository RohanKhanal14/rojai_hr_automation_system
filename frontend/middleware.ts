import { NextRequest, NextResponse } from "next/server";

/**
 * Protected route prefixes — require an active accessToken cookie.
 * Any request to these paths without the cookie is redirected to /login.
 */
const PROTECTED_PREFIXES = [
  "/candidate",
  "/hr",
  "/dashboard",
  "/settings",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = req.cookies.has("accessToken");

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !hasToken) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/candidate/:path*",
    "/hr/:path*",
    "/dashboard/:path*",
    "/settings/:path*",
  ],
};
