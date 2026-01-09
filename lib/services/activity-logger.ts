import { prisma } from "@/lib/prisma";
import { ActivityType } from "@/lib/generated/prisma/client";

export interface LogActivityParams {
  type: ActivityType;
  action: string;
  actionAr: string;
  userId?: string;
  targetUserId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: Record<string, any>;
  request?: Request;
}

/**
 * Log an activity to the database
 *
 * @param params - Activity log parameters
 * @returns The created activity log entry
 *
 * @example
 * ```typescript
 * // Log user registration
 * await logActivity({
 *   type: 'USER_REGISTERED',
 *   action: 'User registered',
 *   actionAr: 'تسجيل مستخدم جديد',
 *   userId: user.id,
 *   metadata: { email: user.email }
 * });
 *
 * // Log admin action
 * await logActivity({
 *   type: 'USER_BANNED',
 *   action: 'Admin banned user',
 *   actionAr: 'المشرف حظر المستخدم',
 *   userId: admin.id,
 *   targetUserId: bannedUser.id,
 *   metadata: { reason: 'Spam' }
 * });
 * ```
 */
export async function logActivity(params: LogActivityParams) {
  const {
    type,
    action,
    actionAr,
    userId,
    targetUserId,
    relatedEntityId,
    relatedEntityType,
    metadata,
    request,
  } = params;

  // Extract IP and user agent from request if provided
  let ipAddress: string | undefined;
  let userAgent: string | undefined;

  if (request) {
    // Try to get IP from various headers (handles proxies)
    ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      undefined;
    userAgent = request.headers.get("user-agent") || undefined;
  }

  try {
    const activityLog = await prisma.activityLog.create({
      data: {
        type,
        action,
        actionAr,
        userId,
        targetUserId,
        relatedEntityId,
        relatedEntityType,
        metadata: metadata || {},
        ipAddress,
        userAgent,
      },
    });

    return activityLog;
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - we don't want logging failures to break the app
    return null;
  }
}

/**
 * Helper function to log user registration
 */
export async function logUserRegistration(userId: string, email?: string) {
  return logActivity({
    type: "USER_REGISTERED",
    action: "New user registered",
    actionAr: "تسجيل مستخدم جديد",
    userId,
    metadata: { email },
  });
}

/**
 * Helper function to log user login
 */
export async function logUserLogin(userId: string) {
  return logActivity({
    type: "USER_LOGIN",
    action: "User logged in",
    actionAr: "تسجيل دخول المستخدم",
    userId,
  });
}

/**
 * Helper function to log user ban
 */
export async function logUserBan(
  adminId: string,
  targetUserId: string,
  reason: string
) {
  return logActivity({
    type: "USER_BANNED",
    action: "Admin banned user",
    actionAr: "المشرف حظر المستخدم",
    userId: adminId,
    targetUserId,
    metadata: { reason },
  });
}

/**
 * Helper function to log user unban
 */
export async function logUserUnban(adminId: string, targetUserId: string) {
  return logActivity({
    type: "USER_UNBANNED",
    action: "Admin unbanned user",
    actionAr: "المشرف أزال الحظر عن المستخدم",
    userId: adminId,
    targetUserId,
  });
}

/**
 * Helper function to log listing creation
 */
export async function logListingCreated(
  userId: string,
  listingId: string,
  listingType: string
) {
  return logActivity({
    type: "LISTING_CREATED",
    action: `Created ${listingType} listing`,
    actionAr: `إنشاء إعلان ${listingType === "WTS" ? "للبيع" : "للشراء"}`,
    userId,
    relatedEntityId: listingId,
    relatedEntityType: "LISTING",
  });
}

/**
 * Helper function to log trade completion
 */
export async function logTradeCompleted(
  buyerId: string,
  sellerId: string,
  tradeId: string
) {
  return logActivity({
    type: "TRADE_COMPLETED",
    action: "Trade completed",
    actionAr: "اكتملت الصفقة",
    userId: buyerId,
    relatedEntityId: tradeId,
    relatedEntityType: "TRADE",
    metadata: { sellerId },
  });
}

/**
 * Helper function to log guide creation
 */
export async function logGuideCreated(
  userId: string,
  guideId: string,
  title: string
) {
  return logActivity({
    type: "GUIDE_CREATED",
    action: `Created guide: ${title}`,
    actionAr: `إنشاء دليل: ${title}`,
    userId,
    relatedEntityId: guideId,
    relatedEntityType: "GUIDE",
  });
}

/**
 * Helper function to log guide update
 */
export async function logGuideUpdated(
  userId: string,
  guideId: string,
  title: string
) {
  return logActivity({
    type: "GUIDE_UPDATED",
    action: `Updated guide: ${title}`,
    actionAr: `تحديث دليل: ${title}`,
    userId,
    relatedEntityId: guideId,
    relatedEntityType: "GUIDE",
  });
}

/**
 * Helper function to log guide deletion
 */
export async function logGuideDeleted(
  userId: string,
  guideId: string,
  title: string
) {
  return logActivity({
    type: "GUIDE_DELETED",
    action: `Deleted guide: ${title}`,
    actionAr: `حذف دليل: ${title}`,
    userId,
    relatedEntityId: guideId,
    relatedEntityType: "GUIDE",
  });
}

/**
 * Helper function to log map marker addition
 */
export async function logMapMarkerAdded(
  userId: string,
  markerId: string,
  mapName: string
) {
  return logActivity({
    type: "MAP_MARKER_ADDED",
    action: `Added marker to ${mapName}`,
    actionAr: `إضافة علامة إلى ${mapName}`,
    userId,
    relatedEntityId: markerId,
    relatedEntityType: "MARKER",
  });
}

/**
 * Helper function to log map marker deletion
 */
export async function logMapMarkerDeleted(
  userId: string,
  markerId: string,
  mapName: string
) {
  return logActivity({
    type: "MAP_MARKER_DELETED",
    action: `Deleted marker from ${mapName}`,
    actionAr: `حذف علامة من ${mapName}`,
    userId,
    relatedEntityId: markerId,
    relatedEntityType: "MARKER",
  });
}

/**
 * Helper function to log generic admin action
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  actionAr: string,
  metadata?: Record<string, any>
) {
  return logActivity({
    type: "ADMIN_ACTION",
    action,
    actionAr,
    userId: adminId,
    metadata,
  });
}
