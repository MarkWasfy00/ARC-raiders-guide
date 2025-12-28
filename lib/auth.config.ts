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
      const isOnProtected = nextUrl.pathname.startsWith("/dashboard") ||
                           nextUrl.pathname.startsWith("/events");

      if (isOnProtected && !isLoggedIn) {
        return false; // Redirect to login page
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Preserve email in token for profile lookups
        if (user.email) {
          token.email = user.email;
        }
        // Store sessionVersion in token for validation
        const sessionVersion = (user as any).sessionVersion;
        console.log('JWT callback - user.sessionVersion:', sessionVersion);
        if (sessionVersion !== undefined) {
          token.sessionVersion = sessionVersion;
          console.log('JWT callback - token.sessionVersion set to:', token.sessionVersion);
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
      }
      return session;
    },
  },
  providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig;
