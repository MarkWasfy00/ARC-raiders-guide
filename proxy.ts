import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Proxy middleware for authentication (Next.js 16+)
// Runs in Node.js runtime, so Prisma is supported
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === 'ADMIN';
  const isBanned = (req.auth?.user as any)?.banned === true;
  const { pathname } = req.nextUrl;

  // Define protected routes
  const isProtectedRoute = pathname.startsWith("/dashboard") ||
                          pathname.startsWith("/events") ||
                          pathname.startsWith("/profile");

  // Define admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  // Define auth routes
  const isAuthRoute = pathname.startsWith("/login") ||
                     pathname.startsWith("/register");

  // Define banned page route
  const isBannedRoute = pathname.startsWith("/banned");

  // Redirect banned users to banned page (except if already on banned page)
  if (isLoggedIn && isBanned && !isBannedRoute) {
    return NextResponse.redirect(new URL("/banned", req.url));
  }

  // Prevent non-banned users from accessing banned page
  if (isBannedRoute && (!isLoggedIn || !isBanned)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect non-admin users to unauthorized page when trying to access /admin routes
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

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
