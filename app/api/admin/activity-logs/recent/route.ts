import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Check staff authorization (admin or moderator)
  const session = await auth();
  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  if (!session?.user?.id || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Get recent activity logs with user information
    const activityLogs = await prisma.activityLog.findMany({
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
    });

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
      created_at: log.created_at.toISOString(),
    }));

    return NextResponse.json({
      activityLogs: formattedLogs,
      count: formattedLogs.length,
    });
  } catch (error) {
    console.error("Error fetching recent activity logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
