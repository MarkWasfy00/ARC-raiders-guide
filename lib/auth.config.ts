import type { NextAuthConfig } from "next-auth";

// Edge-safe auth configuration (no Prisma imports)
// Used by middleware which runs in Edge Runtime
export const authConfig = {
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === 'ADMIN';
      const isModerator = auth?.user?.role === 'MODERATOR';
      const isStaff = isAdmin || isModerator;

      const isOnProtected = nextUrl.pathname.startsWith("/dashboard") ||
                           nextUrl.pathname.startsWith("/events");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      if (isOnProtected && !isLoggedIn) {
        return false; // Redirect to login page
      }

      // Redirect non-staff users to unauthorized page when trying to access /admin routes
      if (isOnAdmin && !isStaff) {
        return Response.redirect(new URL('/unauthorized', nextUrl.origin));
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        // Preserve email in token for profile lookups
        if (user.email) {
          token.email = user.email;
        }
        // Store sessionVersion in token for validation
        const sessionVersion = (user as any).sessionVersion;
        if (sessionVersion !== undefined) {
          token.sessionVersion = sessionVersion;
        }
        // Store banned status (will be checked on every request in proxy.ts)
        token.banned = (user as any).banned || false;
        // Store role in token for middleware authorization
        const role = (user as any).role;
        if (role) {
          token.role = role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // Ensure email is included in session for profile lookups
        if (token.email) {
          session.user.email = token.email as string;
        }
        // Include role from token for middleware (Edge runtime can't access database)
        if (token.role) {
          (session.user as any).role = token.role;
        }
      }
      return session;
    },
  },
  providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig;
