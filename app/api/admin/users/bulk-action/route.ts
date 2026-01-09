import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logUserBan, logUserUnban } from "@/lib/services/activity-logger";

export async function POST(request: Request) {
  // Check admin authorization
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userIds, action, reason } = body;

    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!["ban", "unban"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'ban' or 'unban'" },
        { status: 400 }
      );
    }

    if (action === "ban" && !reason) {
      return NextResponse.json(
        { error: "reason is required for ban action" },
        { status: 400 }
      );
    }

    // Check if trying to ban/unban self
    if (userIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Cannot perform action on yourself" },
        { status: 400 }
      );
    }

    // Check if trying to ban/unban other admins
    const targetUsers = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        role: true,
      },
    });

    const adminUsers = targetUsers.filter((user) => user.role === "ADMIN");
    if (adminUsers.length > 0) {
      return NextResponse.json(
        { error: "Cannot perform action on admin users" },
        { status: 400 }
      );
    }

    let updatedCount = 0;

    if (action === "ban") {
      // Ban users
      const result = await prisma.user.updateMany({
        where: {
          id: {
            in: userIds,
          },
          role: "USER", // Only ban regular users
        },
        data: {
          banned: true,
          bannedAt: new Date(),
          banReason: reason,
          sessionVersion: {
            increment: 1, // Invalidate sessions
          },
        },
      });

      updatedCount = result.count;

      // Log each ban action
      for (const userId of userIds) {
        await logUserBan(session.user.id, userId, reason);
      }
    } else {
      // Unban users
      const result = await prisma.user.updateMany({
        where: {
          id: {
            in: userIds,
          },
        },
        data: {
          banned: false,
          bannedAt: null,
          banReason: null,
        },
      });

      updatedCount = result.count;

      // Log each unban action
      for (const userId of userIds) {
        await logUserUnban(session.user.id, userId);
      }
    }

    return NextResponse.json({
      success: true,
      action,
      updatedCount,
      message: `Successfully ${action === "ban" ? "banned" : "unbanned"} ${updatedCount} user(s)`,
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
