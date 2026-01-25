import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityType, Prisma } from "@/lib/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Check if user is staff (admin or moderator)
    const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
    if (!session?.user?.role || !isStaff) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const userId = searchParams.get("userId") || "";
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ActivityLogWhereInput = {};

    // Filter by activity type
    if (type && type !== "all") {
      where.type = type as ActivityType;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to include the end date fully
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.created_at.lte = end;
      }
    }

    // Filter by user
    if (userId) {
      where.userId = userId;
    }

    // Search in action text or user info
    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { actionAr: { contains: search, mode: "insensitive" } },
        { user: { username: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { targetUser: { username: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get activity logs with pagination
    const [activityLogs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
          targetUser: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    // Format the response
    const formattedLogs = activityLogs.map((log) => ({
      id: log.id,
      type: log.type,
      action: log.action,
      actionAr: log.actionAr,
      user: log.user
        ? {
            id: log.user.id,
            username: log.user.username,
            name: log.user.name,
            email: log.user.email,
            image: log.user.image,
            role: log.user.role,
          }
        : null,
      targetUser: log.targetUser
        ? {
            id: log.targetUser.id,
            username: log.targetUser.username,
            name: log.targetUser.name,
            email: log.targetUser.email,
            image: log.targetUser.image,
            role: log.targetUser.role,
          }
        : null,
      relatedEntityId: log.relatedEntityId,
      relatedEntityType: log.relatedEntityType,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      created_at: log.created_at.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      activityLogs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
