import { NextResponse } from "next/server";
import type { Notification } from "@/lib/generated/prisma/client";

/**
 * Internal API endpoint to emit notifications via Socket.IO
 * This endpoint should only be called from server-side code (server actions)
 * It checks for a secret header to prevent external abuse
 */
export async function POST(req: Request) {
  try {
    // Verify internal request (check for internal header)
    const internalSecret = req.headers.get("x-internal-secret");
    if (internalSecret !== process.env.AUTH_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, notification } = (await req.json()) as {
      userId: string;
      notification: Notification;
    };

    if (!userId || !notification) {
      return NextResponse.json(
        { error: "Missing userId or notification" },
        { status: 400 }
      );
    }

    // Emit via Socket.IO
    if (global.io) {
      global.io.to(`notifications:${userId}`).emit("new-notification", notification);
      return NextResponse.json({ success: true, emitted: true });
    }

    return NextResponse.json({ success: true, emitted: false });
  } catch (error) {
    console.error("Error emitting notification:", error);
    return NextResponse.json(
      { error: "Failed to emit notification" },
      { status: 500 }
    );
  }
}
