import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Leave chat (cancel trade)
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

    // Get the chat with listing info and verify user is a participant
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        listing: true,
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if this chat is the active trader - if so, reactivate the queue
    const isActiveTrader = chat.listing.activeTraderChatId === chatId;
    let reactivatedChats: { id: string; participant1Id: string; participant2Id: string }[] = [];

    if (isActiveTrader) {
      // Use transaction to handle both cancellation and queue reactivation
      const result = await prisma.$transaction(async (tx) => {
        // Clear the active trader from the listing
        await tx.listing.update({
          where: { id: chat.listingId },
          data: {
            activeTraderChatId: null,
            activeTraderUserId: null,
          },
        });

        // Mark this chat as cancelled
        await tx.chat.update({
          where: { id: chatId },
          data: { status: "CANCELLED" },
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
        const reactivated = await tx.chat.findMany({
          where: {
            listingId: chat.listingId,
            status: "ACTIVE",
            id: { not: chatId },
          },
          select: {
            id: true,
            participant1Id: true,
            participant2Id: true,
          },
        });

        return { reactivated };
      });

      reactivatedChats = result.reactivated;
    } else {
      // Just cancel this chat normally
      await prisma.chat.update({
        where: { id: chatId },
        data: { status: "CANCELLED" },
      });
    }

    // Fetch updated chat with all relations for Socket.IO broadcast
    const fullChat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participant1: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        participant2: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        listing: {
          include: {
            item: true,
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Emit Socket.IO events
    if (global.io && fullChat) {
      // Notify this chat that it's been cancelled
      global.io.to(chatId).emit("chat-updated", fullChat);

      // If this was the active trader, notify reactivated chats
      if (isActiveTrader && reactivatedChats.length > 0) {
        const listingOwnerId = chat.listing.userId;

        for (const reactivatedChat of reactivatedChats) {
          global.io.to(reactivatedChat.id).emit("chat-updated", {
            id: reactivatedChat.id,
            status: "ACTIVE",
            isSelectedTrader: false,
          });

          // Notify each non-owner participant
          const otherUserId = reactivatedChat.participant1Id === listingOwnerId
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
          reactivatedCount: reactivatedChats.length,
        });
      }
    }

    return NextResponse.json({
      success: true,
      status: "CANCELLED",
      queueReactivated: isActiveTrader,
      reactivatedChatsCount: reactivatedChats.length,
    });
  } catch (error) {
    console.error("Error leaving chat:", error);
    return NextResponse.json(
      { error: "Failed to leave chat" },
      { status: 500 }
    );
  }
}
