import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// POST - Owner selects a user to trade with
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
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Verify that the current user is the listing owner
    if (chat.listing.userId !== userId) {
      return NextResponse.json(
        { error: "Only the listing owner can select a trader" },
        { status: 403 }
      );
    }

    // Check if chat is still active
    if (chat.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Cannot select trader for a non-active chat" },
        { status: 400 }
      );
    }

    // Check if there's already an active trader for this listing
    if (chat.listing.activeTraderChatId && chat.listing.activeTraderChatId !== chatId) {
      return NextResponse.json(
        { error: "There is already an active trader for this listing" },
        { status: 400 }
      );
    }

    // Determine the selected user (the other participant, not the owner)
    const selectedUserId = chat.participant1Id === userId
      ? chat.participant2Id
      : chat.participant1Id;

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update the listing with active trader info
      await tx.listing.update({
        where: { id: chat.listingId },
        data: {
          activeTraderChatId: chatId,
          activeTraderUserId: selectedUserId,
        },
      });

      // Update all OTHER active chats for this listing to OWNER_TRADING
      await tx.chat.updateMany({
        where: {
          listingId: chat.listingId,
          id: { not: chatId },
          status: "ACTIVE",
        },
        data: {
          status: "OWNER_TRADING",
        },
      });

      // Fetch all affected chats for Socket.IO notifications
      const affectedChats = await tx.chat.findMany({
        where: {
          listingId: chat.listingId,
          id: { not: chatId },
          status: "OWNER_TRADING",
        },
        select: {
          id: true,
          participant1Id: true,
          participant2Id: true,
          status: true,
        },
      });

      return { affectedChats };
    });

    // Emit Socket.IO events
    if (global.io) {
      // Notify the selected chat that they've been selected
      global.io.to(chatId).emit("chat-updated", {
        id: chatId,
        isSelectedTrader: true,
      });

      // Notify all other chats that they're now in queue
      for (const affectedChat of result.affectedChats) {
        global.io.to(affectedChat.id).emit("chat-updated", {
          id: affectedChat.id,
          status: "OWNER_TRADING",
          isSelectedTrader: false,
        });
      }

      // Emit to the listing room for any listening components
      global.io.to(`listing:${chat.listingId}`).emit("trader-selected", {
        listingId: chat.listingId,
        selectedChatId: chatId,
        selectedUserId: selectedUserId,
      });
    }

    return NextResponse.json({
      success: true,
      selectedChatId: chatId,
      selectedUserId: selectedUserId,
      affectedChatsCount: result.affectedChats.length,
    });
  } catch (error) {
    console.error("Error selecting trader:", error);
    return NextResponse.json(
      { error: "Failed to select trader" },
      { status: 500 }
    );
  }
}
