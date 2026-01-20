"use server";

import { prisma } from "@/lib/prisma";
import { createVerificationToken, verifyToken } from "@/lib/verification-token";
import { sendVerificationEmail } from "@/lib/email";

export interface VerificationResponse {
  success: boolean;
  error?: string;
}

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
 * Resend verification email
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
      return { success: true };
    }

    // Check if already verified
    if (user.emailVerified) {
      return {
        success: false,
        error: "تم تأكيد البريد الإلكتروني مسبقاً",
      };
    }

    // Generate new verification token
    const token = await createVerificationToken(email);

    // Send verification email
    await sendVerificationEmail(email, token);

    return { success: true };
  } catch (error) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      error: "حدث خطأ أثناء إرسال رسالة التحقق",
    };
  }
}
