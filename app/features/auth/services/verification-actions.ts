"use server";

import { prisma } from "@/lib/prisma";
import { createVerificationToken, verifyToken } from "@/lib/verification-token";
import { sendVerificationEmail } from "@/lib/email";

export interface VerificationResponse {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  cooldownSeconds?: number;
}

const MAX_RESEND_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60; // 1 minute between resends

/**
 * Verify email with the provided token
 */
export async function verifyEmailAction(token: string): Promise<VerificationResponse> {
  try {
    if (!token) {
      return {
        success: false,
        error: "رمز التحقق مطلوب",
      };
    }

    // Verify token and get email
    const email = await verifyToken(token);

    if (!email) {
      return {
        success: false,
        error: "رمز التحقق غير صالح أو منتهي الصلاحية",
      };
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        error: "المستخدم غير موجود",
      };
    }

    // Check if already verified
    if (user.emailVerified) {
      return {
        success: true, // Still success, just already verified
      };
    }

    // Update user's emailVerified timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء التحقق من البريد الإلكتروني",
    };
  }
}

/**
 * Resend verification email with rate limiting
 * - Maximum 3 resend attempts
 * - 60 second cooldown between resends
 */
export async function resendVerificationAction(email: string): Promise<VerificationResponse> {
  try {
    if (!email) {
      return {
        success: false,
        error: "البريد الإلكتروني مطلوب",
      };
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return { success: true, remainingAttempts: 0 };
    }

    // Check if already verified
    if (user.emailVerified) {
      return {
        success: false,
        error: "تم تأكيد البريد الإلكتروني مسبقاً",
      };
    }

    // Check existing verification token for rate limiting
    const existingToken = await prisma.emailVerificationToken.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (existingToken) {
      // Check if max resend attempts reached
      if (existingToken.resendCount >= MAX_RESEND_ATTEMPTS) {
        return {
          success: false,
          error: "لقد تجاوزت الحد الأقصى لإعادة الإرسال. يرجى المحاولة لاحقاً أو التواصل مع الدعم.",
          remainingAttempts: 0,
        };
      }

      // Check cooldown
      if (existingToken.lastResentAt) {
        const timeSinceLastResend = Math.floor(
          (Date.now() - existingToken.lastResentAt.getTime()) / 1000
        );
        const remainingCooldown = RESEND_COOLDOWN_SECONDS - timeSinceLastResend;

        if (remainingCooldown > 0) {
          return {
            success: false,
            error: `يرجى الانتظار ${remainingCooldown} ثانية قبل إعادة الإرسال`,
            remainingAttempts: MAX_RESEND_ATTEMPTS - existingToken.resendCount,
            cooldownSeconds: remainingCooldown,
          };
        }
      }

      // Update resend count and timestamp
      await prisma.emailVerificationToken.update({
        where: { id: existingToken.id },
        data: {
          resendCount: existingToken.resendCount + 1,
          lastResentAt: new Date(),
        },
      });

      // Send verification email with existing token
      await sendVerificationEmail(email, existingToken.token);

      return {
        success: true,
        remainingAttempts: MAX_RESEND_ATTEMPTS - (existingToken.resendCount + 1),
      };
    }

    // No existing token, create new one
    const token = await createVerificationToken(email);
    await sendVerificationEmail(email, token);

    return {
      success: true,
      remainingAttempts: MAX_RESEND_ATTEMPTS,
    };
  } catch (error) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء إرسال رسالة التحقق",
    };
  }
}

/**
 * Get remaining resend attempts for an email
 */
export async function getResendStatusAction(email: string): Promise<{
  remainingAttempts: number;
  cooldownSeconds: number;
}> {
  const existingToken = await prisma.emailVerificationToken.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });

  if (!existingToken) {
    return {
      remainingAttempts: MAX_RESEND_ATTEMPTS,
      cooldownSeconds: 0,
    };
  }

  const remainingAttempts = Math.max(0, MAX_RESEND_ATTEMPTS - existingToken.resendCount);

  let cooldownSeconds = 0;
  if (existingToken.lastResentAt) {
    const timeSinceLastResend = Math.floor(
      (Date.now() - existingToken.lastResentAt.getTime()) / 1000
    );
    cooldownSeconds = Math.max(0, RESEND_COOLDOWN_SECONDS - timeSinceLastResend);
  }

  return {
    remainingAttempts,
    cooldownSeconds,
  };
}
