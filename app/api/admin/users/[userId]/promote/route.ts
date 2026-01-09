import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/services/activity-logger";

// Promote user to ADMIN
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

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "User is already an admin" },
        { status: 400 }
      );
    }

    // Promote to admin
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: "ADMIN",
        sessionVersion: {
          increment: 1, // Force re-login to get new role
        },
      },
    });

    // Log admin action
    await logAdminAction(
      session.user.id,
      `Promoted user to admin: ${user.username || user.email}`,
      `ترقية المستخدم إلى مشرف: ${user.username || user.email}`,
      { targetUserId: userId, targetUsername: user.username }
    );

    return NextResponse.json({
      success: true,
      message: `User ${user.username || user.email} promoted to ADMIN`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: "ADMIN",
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

// Demote ADMIN to USER
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

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "User is not an admin" },
        { status: 400 }
      );
    }

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
      `Demoted admin to user: ${user.username || user.email}`,
      `تخفيض رتبة المشرف إلى مستخدم: ${user.username || user.email}`,
      { targetUserId: userId, targetUsername: user.username }
    );

    return NextResponse.json({
      success: true,
      message: `Admin ${user.username || user.email} demoted to USER`,
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
