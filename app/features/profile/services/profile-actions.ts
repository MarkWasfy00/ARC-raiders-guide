"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deleteFile, extractFilenameFromUrl } from "@/lib/minio";
import type { UpdateProfileData, ProfileUpdateResponse, UserProfile } from "../types";

export async function getUserProfile(): Promise<UserProfile | null> {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      image: true,
      embark_id: true,
      discord_username: true,
      accounts: {
        where: { provider: "discord" },
        select: { id: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    image: user.image,
    embark_id: user.embark_id,
    discord_username: user.discord_username,
    hasDiscordLinked: user.accounts.length > 0,
  };
}

export async function updateProfile(
  data: UpdateProfileData
): Promise<ProfileUpdateResponse> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        success: false,
        error: {
          message: "You must be logged in to update your profile",
        },
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          where: { provider: "discord" },
          select: { id: true },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: {
          message: "User not found",
        },
      };
    }

    // Check if username is taken (if being updated)
    if (data.username && data.username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser) {
        return {
          success: false,
          error: {
            message: "Username is already taken",
            field: "username",
          },
        };
      }
    }

    // Validate and check embark_id uniqueness (if being updated)
    let normalizedEmbarkId = data.embark_id?.trim() || null;
    if (normalizedEmbarkId) {
      // Validate embark_id pattern: Username#0000 (letters, numbers, underscores followed by # and 1-6 digits)
      const embarkIdRegex = /^[a-zA-Z0-9_]{1,32}#\d{1,6}$/;
      if (!embarkIdRegex.test(normalizedEmbarkId)) {
        return {
          success: false,
          error: {
            message: "معرف إمبارك غير صالح. يجب أن يكون بالصيغة: Username#0000",
            field: "embark_id",
          },
        };
      }

      // Check if embark_id is taken by another user
      if (normalizedEmbarkId !== user.embark_id) {
        const existingEmbarkId = await prisma.user.findFirst({
          where: { embark_id: normalizedEmbarkId },
        });

        if (existingEmbarkId) {
          return {
            success: false,
            error: {
              message: "معرف إمبارك هذا مستخدم بالفعل من قبل مستخدم آخر",
              field: "embark_id",
            },
          };
        }
      }
    }

    // Check if user has Discord linked - if so, don't allow changing discord_username
    const hasDiscordLinked = user.accounts.length > 0;

    // Update user profile
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        username: data.username,
        embark_id: normalizedEmbarkId,
        // Only update discord_username if user doesn't have Discord linked
        ...(hasDiscordLinked ? {} : { discord_username: data.discord_username }),
      },
    });

    revalidatePath("/profile");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: {
        message: "An error occurred while updating your profile",
      },
    };
  }
}

export async function updateProfileImage(
  imageUrl: string | null
): Promise<ProfileUpdateResponse> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        success: false,
        error: {
          message: "يجب تسجيل الدخول لتحديث صورة الملف الشخصي",
        },
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return {
        success: false,
        error: {
          message: "المستخدم غير موجود",
        },
      };
    }

    // Update user image
    await prisma.user.update({
      where: { id: user.id },
      data: {
        image: imageUrl,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Profile image update error:", error);
    return {
      success: false,
      error: {
        message: "حدث خطأ أثناء تحديث الصورة",
      },
    };
  }
}

export async function removeProfileImage(): Promise<ProfileUpdateResponse> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        success: false,
        error: {
          message: "يجب تسجيل الدخول لحذف صورة الملف الشخصي",
        },
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        image: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: {
          message: "المستخدم غير موجود",
        },
      };
    }

    // Delete image from MinIO if exists
    if (user.image) {
      const filename = extractFilenameFromUrl(user.image);
      if (filename) {
        try {
          await deleteFile(filename);
          console.log(`✅ Deleted profile image: ${filename}`);
        } catch (deleteError) {
          console.error("⚠️  Warning: Failed to delete image from MinIO:", deleteError);
          // Continue with database update despite deletion failure
        }
      }
    }

    // Update user image to null
    await prisma.user.update({
      where: { id: user.id },
      data: {
        image: null,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Profile image removal error:", error);
    return {
      success: false,
      error: {
        message: "حدث خطأ أثناء حذف الصورة",
      },
    };
  }
}
