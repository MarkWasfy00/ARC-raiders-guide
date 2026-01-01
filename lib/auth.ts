import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    // Override session callback to always fetch fresh user data and validate session version
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;

        // Fetch fresh user data from database
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              username: true,
              embark_id: true,
              discord_username: true,
              sessionVersion: true,
              role: true,
            },
          });

          // Debug logging
          console.log('Session callback - token.sessionVersion:', token.sessionVersion);
          console.log('Session callback - dbUser.sessionVersion:', dbUser?.sessionVersion);

          // Validate session version - if mismatch, session is invalidated
          if (dbUser && typeof token.sessionVersion === 'number' && typeof dbUser.sessionVersion === 'number') {
            if (dbUser.sessionVersion !== token.sessionVersion) {
              console.log('🔴 SESSION INVALIDATED - Version mismatch!');
              // Session has been invalidated - throw error to force re-login
              throw new Error('Session invalidated');
            }
          }

          // Update session with fresh data from database
          if (dbUser) {
            session.user.email = dbUser.email || '';
            session.user.name = dbUser.name || '';
            session.user.image = dbUser.image || '';
            // Add custom fields to session
            (session.user as any).username = dbUser.username;
            (session.user as any).embark_id = dbUser.embark_id;
            (session.user as any).discord_username = dbUser.discord_username;
            (session.user as any).role = dbUser.role;
          }
        }
      }
      return session;
    },
  },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.global_name ?? profile.username,
          email: profile.email,
          image: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null,
          username: profile.username,
          discord_username: `${profile.username}${profile.discriminator !== "0" ? `#${profile.discriminator}` : ""}`,
        };
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        const userResponse = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          sessionVersion: user.sessionVersion,
          role: user.role,
        };

        console.log('Authorize callback - returning user with sessionVersion:', user.sessionVersion);

        return userResponse;
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      // After a user is created via OAuth, update with additional fields if needed
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (dbUser && !dbUser.username) {
          // Generate a username from email if not set
          const emailUsername = user.email.split("@")[0];
          let username = emailUsername;
          let counter = 1;

          // Ensure username is unique
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${emailUsername}${counter}`;
            counter++;
          }

          await prisma.user.update({
            where: { id: dbUser.id },
            data: { username },
          });
        }
      }
    },
    async linkAccount({ user, account, profile }) {
      // When an account is linked (e.g., Discord), update user with provider-specific info
      if (account.provider === "discord" && profile && user.email) {
        const discordProfile = profile as any;
        const discord_username = `${discordProfile.username}${discordProfile.discriminator !== "0" ? `#${discordProfile.discriminator}` : ""}`;

        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (dbUser && !dbUser.discord_username) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { discord_username },
          });
        }
      }
    },
  },
});
