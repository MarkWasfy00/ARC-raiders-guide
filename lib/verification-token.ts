import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_EXPIRY_HOURS = 24;

/**
 * Generate a random token for email verification
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash a token using SHA-256 for secure storage
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Create a new verification token for an email address
 * Deletes any existing tokens for the same email first
 */
export async function createVerificationToken(email: string): Promise<string> {
  // Delete any existing tokens for this email
  await prisma.emailVerificationToken.deleteMany({
    where: { email },
  });

  // Generate new token
  const token = generateToken();
  const hashedToken = hashToken(token);

  // Calculate expiry (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

  // Store hashed token in database
  await prisma.emailVerificationToken.create({
    data: {
      email,
      token: hashedToken,
      expiresAt,
    },
  });

  // Return the plain token (to send in email)
  return token;
}

/**
 * Verify a token and return the associated email if valid
 * Deletes the token after successful verification
 * Returns null if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<string | null> {
  const hashedToken = hashToken(token);

  // Find the token in database
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token: hashedToken },
  });

  if (!verificationToken) {
    return null;
  }

  // Check if token has expired
  if (new Date() > verificationToken.expiresAt) {
    // Delete expired token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });
    return null;
  }

  // Delete the token (one-time use)
  await prisma.emailVerificationToken.delete({
    where: { id: verificationToken.id },
  });

  return verificationToken.email;
}

/**
 * Clean up expired tokens (can be called periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.emailVerificationToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}
