import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Proxy middleware for authentication (Next.js 16+)
// Runs in Node.js runtime, so Prisma is supported
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Define protected routes
  const isProtectedRoute = pathname.startsWith("/dashboard") ||
                          pathname.startsWith("/traders") ||
                          pathname.startsWith("/events") ||
                          pathname.startsWith("/profile");

  // Define auth routes
  const isAuthRoute = pathname.startsWith("/login") ||
                     pathname.startsWith("/register");

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages to home
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
