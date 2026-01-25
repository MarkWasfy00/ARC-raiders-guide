import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/services/activity-logger";
import { UserRole } from "@/lib/generated/prisma/client";

// Promote user to ADMIN or MODERATOR
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Check admin authorization
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await params;

    // Parse request body for target role
    let targetRole: UserRole = UserRole.ADMIN; // Default to ADMIN for backwards compatibility
    try {
      const body = await request.json();
      if (body.targetRole && ["ADMIN", "MODERATOR"].includes(body.targetRole)) {
        targetRole = body.targetRole as UserRole;
      }
    } catch {
      // If no body or invalid JSON, use default (ADMIN)
    }

    // Check if trying to modify self
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot modify your own role" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === targetRole) {
      return NextResponse.json(
        { error: `User is already a ${targetRole.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Promote to target role
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: targetRole,
        sessionVersion: {
          increment: 1, // Force re-login to get new role
        },
      },
    });

    const roleLabel = targetRole === "ADMIN" ? "مشرف (Admin)" : "مراقب (Moderator)";

    // Log admin action
    await logAdminAction(
      session.user.id,
      `Promoted user to ${targetRole.toLowerCase()}: ${user.username || user.email}`,
      `ترقية المستخدم إلى ${roleLabel}: ${user.username || user.email}`,
      { targetUserId: userId, targetUsername: user.username, targetRole }
    );

    return NextResponse.json({
      success: true,
      message: `User ${user.username || user.email} promoted to ${targetRole}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: targetRole,
      },
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Demote ADMIN or MODERATOR to USER
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Check admin authorization
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await params;

    // Check if trying to modify self
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot demote yourself" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "USER") {
      return NextResponse.json(
        { error: "User is already a regular user" },
        { status: 400 }
      );
    }

    const previousRole = user.role;
    const previousRoleLabel = previousRole === "ADMIN" ? "مشرف (Admin)" : "مراقب (Moderator)";

    // Demote to user
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: "USER",
        sessionVersion: {
          increment: 1, // Force re-login to get new role
        },
      },
    });

    // Log admin action
    await logAdminAction(
      session.user.id,
      `Demoted ${previousRole.toLowerCase()} to user: ${user.username || user.email}`,
      `تخفيض رتبة ${previousRoleLabel} إلى مستخدم: ${user.username || user.email}`,
      { targetUserId: userId, targetUsername: user.username, previousRole }
    );

    return NextResponse.json({
      success: true,
      message: `${previousRole} ${user.username || user.email} demoted to USER`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: "USER",
      },
    });
  } catch (error) {
    console.error("Error demoting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
