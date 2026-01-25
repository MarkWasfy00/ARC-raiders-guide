import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// POST - Owner releases current trader (trade failed/cancelled) and reactivates queue
export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const userId = session.user.id;

    // Fetch the chat with listing info
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        listing: true,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Verify that the current user is the listing owner
    if (chat.listing.userId !== userId) {
      return NextResponse.json(
        { error: "Only the listing owner can release a trader" },
        { status: 403 }
      );
    }

    // Verify this chat is the current active trader
    if (chat.listing.activeTraderChatId !== chatId) {
      return NextResponse.json(
        { error: "This chat is not the active trade" },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Clear the active trader from the listing
      await tx.listing.update({
        where: { id: chat.listingId },
        data: {
          activeTraderChatId: null,
          activeTraderUserId: null,
        },
      });

      // Update the released chat to CANCELLED
      await tx.chat.update({
        where: { id: chatId },
        data: {
          status: "CANCELLED",
        },
      });

      // Reactivate all OWNER_TRADING chats back to ACTIVE
      await tx.chat.updateMany({
        where: {
          listingId: chat.listingId,
          status: "OWNER_TRADING",
        },
        data: {
          status: "ACTIVE",
        },
      });

      // Fetch all reactivated chats for Socket.IO notifications
      const reactivatedChats = await tx.chat.findMany({
        where: {
          listingId: chat.listingId,
          status: "ACTIVE",
          id: { not: chatId },
        },
        select: {
          id: true,
          participant1Id: true,
          participant2Id: true,
          status: true,
        },
      });

      return { reactivatedChats };
    });

    // Emit Socket.IO events
    if (global.io) {
      // Notify the released chat that it's been cancelled
      global.io.to(chatId).emit("chat-updated", {
        id: chatId,
        status: "CANCELLED",
        isSelectedTrader: false,
      });

      // Notify all reactivated chats that they're back to active
      for (const reactivatedChat of result.reactivatedChats) {
        global.io.to(reactivatedChat.id).emit("chat-updated", {
          id: reactivatedChat.id,
          status: "ACTIVE",
          isSelectedTrader: false,
        });

        // Notify each participant individually
        const otherUserId = reactivatedChat.participant1Id === userId
          ? reactivatedChat.participant2Id
          : reactivatedChat.participant1Id;

        global.io.to(`notifications:${otherUserId}`).emit("queue-reactivated", {
          chatId: reactivatedChat.id,
          listingId: chat.listingId,
          message: "You can now continue negotiating",
        });
      }

      // Emit to the listing room
      global.io.to(`listing:${chat.listingId}`).emit("queue-reactivated", {
        listingId: chat.listingId,
        releasedChatId: chatId,
        reactivatedCount: result.reactivatedChats.length,
      });
    }

    return NextResponse.json({
      success: true,
      releasedChatId: chatId,
      reactivatedChatsCount: result.reactivatedChats.length,
    });
  } catch (error) {
    console.error("Error releasing trader:", error);
    return NextResponse.json(
      { error: "Failed to release trader" },
      { status: 500 }
    );
  }
}
