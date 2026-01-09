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

    // Get the chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
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
    const isParticipant1 = chat.participant1Id === session.user.id;
    const isParticipant2 = chat.participant2Id === session.user.id;

    if (!isParticipant1 && !isParticipant2) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // Update the appropriate lock-in status
    const updatedChat = await prisma.chat.update({
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
        listing: updatedChat.listing,
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
