"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import type { LoginCredentials, RegisterCredentials, AuthResponse } from "../types";
import { logUserRegistration } from "@/lib/services/activity-logger";

export async function loginAction(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    // Check if user is banned
    if (error instanceof Error && error.message === "BANNED") {
      redirect("/banned");
    }

    if (error instanceof AuthError) {
      // Check for banned error in AuthError
      if (error.cause?.err?.message === "BANNED") {
        redirect("/banned");
      }

      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: {
              message: "Invalid email or password",
            },
          };
        default:
          return {
            success: false,
            error: {
              message: "Authentication failed",
            },
          };
      }
    }

    return {
      success: false,
      error: {
        message: "An unexpected error occurred",
      },
    };
  }
}

export async function registerAction(credentials: RegisterCredentials): Promise<AuthResponse> {
  try {
    // Validate input
    if (!credentials.email || !credentials.password || !credentials.name || !credentials.username) {
      return {
        success: false,
        error: {
          message: "All required fields must be filled",
        },
      };
    }

    if (credentials.password !== credentials.confirmPassword) {
      return {
        success: false,
        error: {
          message: "Passwords do not match",
          field: "confirmPassword",
        },
      };
    }

    if (credentials.password.length < 8) {
      return {
        success: false,
        error: {
          message: "Password must be at least 8 characters",
          field: "password",
        },
      };
    }

    // Validate username (alphanumeric and underscores only, 3-20 characters)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(credentials.username)) {
      return {
        success: false,
        error: {
          message: "Username must be 3-20 characters and contain only letters, numbers, and underscores",
          field: "username",
        },
      };
    }

    // Normalize embark_id - add # prefix if not present
    let embark_id = credentials.embark_id;
    if (embark_id && !embark_id.startsWith("#")) {
      embark_id = `#${embark_id}`;
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: credentials.email,
      },
    });

    if (existingEmail) {
      return {
        success: false,
        error: {
          message: "User with this email already exists",
          field: "email",
        },
      };
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: {
        username: credentials.username,
      },
    });

    if (existingUsername) {
      return {
        success: false,
        error: {
          message: "Username is already taken",
          field: "username",
        },
      };
    }

    // Hash password
    const hashedPassword = await hash(credentials.password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username: credentials.username,
        name: credentials.name,
        email: credentials.email,
        password: hashedPassword,
        embark_id: embark_id || null,
        discord_username: credentials.discord_username || null,
      },
    });

    // Log user registration
    await logUserRegistration(newUser.id, credentials.username);

    // Automatically sign in the user
    await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: {
        message: "An unexpected error occurred during registration",
      },
    };
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/");
}

/**
 * Invalidate all sessions for a user by incrementing their session version.
 * This will immediately invalidate all JWT tokens for this user.
 * Use this for security purposes (e.g., password reset, account compromise).
 */
export async function invalidateUserSessions(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      sessionVersion: {
        increment: 1
      }
    },
  });
}

/**
 * Logout and invalidate all sessions for the current user.
 * This will sign out the user and prevent all their existing tokens from working.
 */
export async function logoutAndInvalidateAllSessions(userId: string) {
  // Increment session version to invalidate all tokens
  await invalidateUserSessions(userId);

  // Sign out from current session
  await signOut({ redirect: false });
  redirect("/login");
}

export async function discordSignInAction() {
  await signIn("discord", { redirectTo: "/" });
}
