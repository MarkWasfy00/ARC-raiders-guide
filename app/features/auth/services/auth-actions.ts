"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import type { LoginCredentials, RegisterCredentials, AuthResponse } from "../types";
import { logUserRegistration } from "@/lib/services/activity-logger";
import { createVerificationToken } from "@/lib/verification-token";
import { sendVerificationEmail } from "@/lib/email";

export async function loginAction(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    // First, check if the user exists and if their email is verified
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      select: { emailVerified: true, banned: true },
    });

    if (user && !user.emailVerified) {
      return {
        success: false,
        error: {
          message: "يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول",
          code: "EMAIL_NOT_VERIFIED",
        },
        email: credentials.email,
      };
    }

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
              message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
              code: "INVALID_CREDENTIALS",
            },
          };
        default:
          return {
            success: false,
            error: {
              message: "فشل تسجيل الدخول",
              code: "GENERIC_ERROR",
            },
          };
      }
    }

    return {
      success: false,
      error: {
        message: "حدث خطأ غير متوقع",
        code: "GENERIC_ERROR",
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

    // Validate and normalize embark_id
    let embark_id = credentials.embark_id?.trim() || null;
    if (embark_id) {
      // Validate embark_id pattern: Username#0000 (letters, numbers, underscores followed by # and 1-6 digits)
      const embarkIdRegex = /^[a-zA-Z0-9_]{1,32}#\d{1,6}$/;
      if (!embarkIdRegex.test(embark_id)) {
        return {
          success: false,
          error: {
            message: "معرف إمبارك غير صالح. يجب أن يكون بالصيغة: Username#0000",
            field: "embark_id",
          },
        };
      }
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

    // Check if embark_id already exists
    if (embark_id) {
      const existingEmbarkId = await prisma.user.findFirst({
        where: {
          embark_id: embark_id,
        },
      });

      if (existingEmbarkId) {
        return {
          success: false,
          error: {
            message: "معرف إمبارك هذا مستخدم بالفعل",
            field: "embark_id",
          },
        };
      }
    }

    // Hash password
    const hashedPassword = await hash(credentials.password, 10);

    // Create user (emailVerified is null by default)
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

    // Generate verification token and send email
    const token = await createVerificationToken(credentials.email);
    try {
      await sendVerificationEmail(credentials.email, token);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // In development, continue without email - user can be verified manually
      // In production, you should configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
    }

    return {
      success: true,
      requiresVerification: true,
      email: credentials.email,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: {
        message: "حدث خطأ غير متوقع أثناء التسجيل",
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

export async function linkDiscordAction() {
  await signIn("discord", { redirectTo: "/profile" });
}
