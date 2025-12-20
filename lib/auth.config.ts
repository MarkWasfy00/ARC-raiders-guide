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
                           nextUrl.pathname.startsWith("/traders") ||
                           nextUrl.pathname.startsWith("/events");

      if (isOnProtected && !isLoggedIn) {
        return false; // Redirect to login page
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Providers are added in auth.ts
} satisfies NextAuthConfig;
