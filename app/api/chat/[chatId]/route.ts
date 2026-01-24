import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { chatId } = await params;

    if (!chatId) {
      return NextResponse.json({ error: 'معرف المحادثة مطلوب' }, { status: 400 });
    }

    // Fetch the specific chat with all necessary details
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        listing: {
          select: {
            id: true,
            type: true,
            status: true,
            quantity: true,
            paymentType: true,
            seedsAmount: true,
            activeTraderChatId: true,
            activeTraderUserId: true,
            item: {
              select: {
                id: true,
                name: true,
                icon: true,
                rarity: true,
              },
            },
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
                embark_id: true,
                discord_username: true,
              },
            },
          },
        },
        participant1: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            embark_id: true,
            discord_username: true,
          },
        },
        participant2: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
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
    if (chat.participant1Id !== session.user.id && chat.participant2Id !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // Calculate ratings for both participants
    const [participant1Ratings, participant2Ratings] = await Promise.all([
      prisma.rating.aggregate({
        where: { toUserId: chat.participant1Id },
        _avg: { score: true },
        _count: true,
      }),
      prisma.rating.aggregate({
        where: { toUserId: chat.participant2Id },
        _avg: { score: true },
        _count: true,
      }),
    ]);

    // Check if both participants have locked in
    const bothLockedIn = chat.participant1LockedIn && chat.participant2LockedIn;

    // Add rating data to participants
    // Only show embark_id if both participants have locked in
    const enhancedChat = {
      ...chat,
      participant1: {
        ...chat.participant1,
        embark_id: bothLockedIn ? chat.participant1.embark_id : null,
        averageRating: participant1Ratings._avg.score || 0,
        totalRatings: participant1Ratings._count || 0,
      },
      participant2: {
        ...chat.participant2,
        embark_id: bothLockedIn ? chat.participant2.embark_id : null,
        averageRating: participant2Ratings._avg.score || 0,
        totalRatings: participant2Ratings._count || 0,
      },
    };

    return NextResponse.json(enhancedChat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
