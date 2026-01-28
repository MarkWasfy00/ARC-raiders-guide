import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const resolvedParams = await params;
    const chatId = resolvedParams.chatId;
    const userId = session.user.id;

    // Get the chat with listing info
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        listing: true,
        participant1: {
          select: {
            id: true,
            username: true,
            embark_id: true,
            discord_username: true,
          },
        },
        participant2: {
          select: {
            id: true,
            username: true,
            embark_id: true,
            discord_username: true,
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'المحادثة غير موجودة' }, { status: 404 });
    }

    // Verify user is a participant
    const isParticipant1 = chat.participant1Id === userId;
    const isParticipant2 = chat.participant2Id === userId;

    if (!isParticipant1 && !isParticipant2) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // Check if the current user is the listing owner
    const isListingOwner = chat.listing.userId === userId;

    // Check if we need to auto-select trader (when owner locks in and no active trader)
    const shouldAutoSelectTrader = isListingOwner &&
      !chat.listing.activeTraderChatId &&
      chat.status === 'ACTIVE';

    // Determine the selected user (the other participant, not the owner)
    const selectedUserId = chat.participant1Id === chat.listing.userId
      ? chat.participant2Id
      : chat.participant1Id;

    // Use transaction for atomicity when auto-selecting trader
    const result = await prisma.$transaction(async (tx) => {
      // Update the lock-in status
      const updatedChat = await tx.chat.update({
        where: { id: chatId },
        data: isParticipant1
          ? { participant1LockedIn: true }
          : { participant2LockedIn: true },
        include: {
          listing: {
            include: {
              item: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                  rarity: true,
                },
              },
            },
          },
          participant1: {
            select: {
              id: true,
              username: true,
              embark_id: true,
              discord_username: true,
            },
          },
          participant2: {
            select: {
              id: true,
              username: true,
              embark_id: true,
              discord_username: true,
            },
          },
        },
      });

      let affectedChats: { id: string; participant1Id: string; participant2Id: string; status: string }[] = [];

      // Auto-select trader if owner is locking in
      if (shouldAutoSelectTrader) {
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
            status: 'ACTIVE',
          },
          data: {
            status: 'OWNER_TRADING',
          },
        });

        // Fetch all affected chats for Socket.IO notifications
        affectedChats = await tx.chat.findMany({
          where: {
            listingId: chat.listingId,
            id: { not: chatId },
            status: 'OWNER_TRADING',
          },
          select: {
            id: true,
            participant1Id: true,
            participant2Id: true,
            status: true,
          },
        });
      }

      return { updatedChat, affectedChats };
    });

    const { updatedChat, affectedChats } = result;

    // Check if both participants have locked in
    const bothLockedIn = updatedChat.participant1LockedIn && updatedChat.participant2LockedIn;

    // Prepare the response data
    const responseData = {
      success: true,
      chat: {
        id: updatedChat.id,
        participant1LockedIn: updatedChat.participant1LockedIn,
        participant2LockedIn: updatedChat.participant2LockedIn,
        bothLockedIn,
        listing: {
          ...updatedChat.listing,
          // Include updated active trader info if auto-selected
          activeTraderChatId: shouldAutoSelectTrader ? chatId : updatedChat.listing.activeTraderChatId,
          activeTraderUserId: shouldAutoSelectTrader ? selectedUserId : updatedChat.listing.activeTraderUserId,
        },
        isSelectedTrader: shouldAutoSelectTrader || updatedChat.listing.activeTraderChatId === chatId,
        // Only include embark_id and discord_username if both have locked in
        participant1: {
          id: updatedChat.participant1.id,
          username: updatedChat.participant1.username,
          embark_id: bothLockedIn ? updatedChat.participant1.embark_id : null,
          discord_username: bothLockedIn ? updatedChat.participant1.discord_username : null,
        },
        participant2: {
          id: updatedChat.participant2.id,
          username: updatedChat.participant2.username,
          embark_id: bothLockedIn ? updatedChat.participant2.embark_id : null,
          discord_username: bothLockedIn ? updatedChat.participant2.discord_username : null,
        },
      },
    };

    // Broadcast the update via Socket.IO
    if (global.io) {
      global.io.to(chatId).emit('chat-updated', responseData.chat);

      // If auto-selected, notify other chats that they're now in queue
      if (shouldAutoSelectTrader) {
        for (const affectedChat of affectedChats) {
          global.io.to(affectedChat.id).emit('chat-updated', {
            id: affectedChat.id,
            status: 'OWNER_TRADING',
            isSelectedTrader: false,
          });
        }

        // Emit to the listing room for any listening components
        global.io.to(`listing:${chat.listingId}`).emit('trader-selected', {
          listingId: chat.listingId,
          selectedChatId: chatId,
          selectedUserId: selectedUserId,
        });
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Lock-in error:', error);
    return NextResponse.json(
      { error: 'فشل في تأكيد الدخول' },
      { status: 500 }
    );
  }
}
