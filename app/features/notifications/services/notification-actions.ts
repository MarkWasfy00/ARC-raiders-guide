"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@/lib/generated/prisma/client";

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  metadata,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        metadata: metadata || {},
      },
    });

    // Emit Socket.IO event for real-time notification
    if (global.io) {
      global.io.to(`notifications:${userId}`).emit("new-notification", notification);
    }

    return { success: true, data: notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "فشل إنشاء الإشعار" };
  }
}

/**
 * Get all notifications for the current user
 */
export async function getUserNotifications() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "يجب تسجيل الدخول" };
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 50, // Limit to last 50 notifications
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "فشل جلب الإشعارات" };
  }
}

/**
 * Get unread notification count for the current user
 */
export async function getUnreadNotificationCount() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "يجب تسجيل الدخول" };
    }

    const count = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return { success: true, data: count };
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return { success: false, error: "فشل جلب عدد الإشعارات" };
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "يجب تسجيل الدخول" };
    }

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });

    if (!notification || notification.userId !== session.user.id) {
      return { success: false, error: "الإشعار غير موجود" };
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "فشل تحديث الإشعار" };
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllNotificationsAsRead() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "يجب تسجيل الدخول" };
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: "فشل تحديث الإشعارات" };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "يجب تسجيل الدخول" };
    }

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });

    if (!notification || notification.userId !== session.user.id) {
      return { success: false, error: "الإشعار غير موجود" };
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "فشل حذف الإشعار" };
  }
}
