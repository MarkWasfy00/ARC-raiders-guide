import { auth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { isMaintenanceModeCached } from "@/lib/services/settings-cache";

// Routes that bypass maintenance mode check
const maintenanceBypassRoutes = [
  "/maintenance",
  "/admin",
  "/api",
  "/login",
  "/register",
  "/banned",
  "/unauthorized",
  "/_next",
  "/favicon",
];

// Proxy middleware for authentication (Next.js 16+)
// Runs in Node.js runtime, so Prisma is supported
export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === 'ADMIN';
  const isModerator = req.auth?.user?.role === 'MODERATOR';
  const isStaff = isAdmin || isModerator;
  const isBanned = (req.auth?.user as any)?.banned === true;
  const { pathname } = req.nextUrl;

  // Check maintenance mode (skip for bypass routes)
  const shouldCheckMaintenance = !maintenanceBypassRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (shouldCheckMaintenance && !isAdmin) {
    try {
      const maintenanceEnabled = await isMaintenanceModeCached();
      if (maintenanceEnabled) {
        return NextResponse.redirect(new URL("/maintenance", req.url));
      }
    } catch (error) {
      // If we can't check settings, don't block the request
      console.error("Failed to check maintenance mode:", error);
    }
  }

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

  // Define maintenance page route
  const isMaintenanceRoute = pathname.startsWith("/maintenance");

  // Redirect banned users to banned page (except if already on banned page)
  if (isLoggedIn && isBanned && !isBannedRoute) {
    return NextResponse.redirect(new URL("/banned", req.url));
  }

  // Prevent non-banned users from accessing banned page
  if (isBannedRoute && (!isLoggedIn || !isBanned)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect non-staff users to unauthorized page when trying to access /admin routes
  if (isAdminRoute && !isStaff) {
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

  // Redirect from maintenance page if maintenance is not enabled (for non-admin users)
  if (isMaintenanceRoute && !isAdmin) {
    try {
      const maintenanceEnabled = await isMaintenanceModeCached();
      if (!maintenanceEnabled) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      // If we can't check, redirect to home to be safe
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
