import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Approve trade completion
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

    // Get the chat and verify user is a participant
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id },
        ],
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if both participants have locked in before allowing approval
    if (!chat.participant1LockedIn || !chat.participant2LockedIn) {
      return NextResponse.json(
        { error: "Both participants must lock in before approving the trade" },
        { status: 400 }
      );
    }

    // Determine which participant is approving
    const isParticipant1 = chat.participant1Id === session.user.id;
    const updateData = isParticipant1
      ? { participant1Approved: true }
      : { participant2Approved: true };

    // Update approval status
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: updateData,
    });

    // Check if both participants have approved - BOTH must approve for trade to complete
    const bothApproved = updatedChat.participant1Approved && updatedChat.participant2Approved;

    // If both approved, mark chat and listing as completed and create trade
    if (bothApproved) {
      // Fetch listing to determine buyer/seller
      const listing = await prisma.listing.findUnique({
        where: { id: chat.listingId },
        select: { type: true, userId: true },
      });

      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }

      // Determine buyer and seller based on listing type
      // For WTS: listing owner is seller, other participant is buyer
      // For WTB: listing owner is buyer, other participant is seller
      const isParticipant1Seller =
        (listing.type === "WTS" && listing.userId === chat.participant1Id) ||
        (listing.type === "WTB" && listing.userId !== chat.participant1Id);

      const sellerId = isParticipant1Seller
        ? chat.participant1Id
        : chat.participant2Id;
      const buyerId = isParticipant1Seller
        ? chat.participant2Id
        : chat.participant1Id;

      await prisma.$transaction([
        prisma.chat.update({
          where: { id: chatId },
          data: { status: "COMPLETED" },
        }),
        prisma.listing.update({
          where: { id: chat.listingId },
          data: { status: "COMPLETED" },
        }),
        // Create Trade record
        prisma.trade.create({
          data: {
            listingId: chat.listingId,
            buyerId,
            sellerId,
            status: "COMPLETED",
          },
        }),
      ]);
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

    // Fetch the trade if both approved
    let tradeId = null;
    if (bothApproved) {
      const trade = await prisma.trade.findFirst({
        where: { listingId: chat.listingId },
        orderBy: { created_at: "desc" },
      });
      tradeId = trade?.id || null;
    }

    // Emit Socket.IO event to notify both participants (include tradeId for rating dialog)
    if (global.io && fullChat) {
      global.io.to(chatId).emit("chat-updated", {
        ...fullChat,
        tradeId,
      });
    }

    return NextResponse.json({
      success: true,
      participant1Approved: updatedChat.participant1Approved,
      participant2Approved: updatedChat.participant2Approved,
      status: bothApproved ? "COMPLETED" : updatedChat.status,
      tradeId,
    });
  } catch (error) {
    console.error("Error approving trade:", error);
    return NextResponse.json(
      { error: "Failed to approve trade" },
      { status: 500 }
    );
  }
}
