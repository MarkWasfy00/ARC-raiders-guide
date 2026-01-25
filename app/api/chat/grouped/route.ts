import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch user's chats grouped by listing (for listing owners)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all listings owned by the current user that have chats
    const listingsWithChats = await prisma.listing.findMany({
      where: {
        userId: userId,
        chats: {
          some: {
            status: {
              in: ["ACTIVE", "OWNER_TRADING"],
            },
          },
        },
      },
      select: {
        id: true,
        type: true,
        status: true,
        quantity: true,
        paymentType: true,
        seedsAmount: true,
        description: true,
        created_at: true,
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
        chats: {
          where: {
            status: {
              in: ["ACTIVE", "OWNER_TRADING"],
            },
          },
          select: {
            id: true,
            listingId: true,
            participant1Id: true,
            participant2Id: true,
            participant1LockedIn: true,
            participant2LockedIn: true,
            participant1Approved: true,
            participant2Approved: true,
            status: true,
            created_at: true,
            updated_at: true,
            participant1: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
                embark_id: true,
                discord_username: true,
                ratingsReceived: {
                  select: {
                    score: true,
                    honest: true,
                  },
                },
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
                ratingsReceived: {
                  select: {
                    score: true,
                    honest: true,
                  },
                },
              },
            },
            messages: {
              orderBy: { created_at: "desc" },
              take: 1,
              select: {
                id: true,
                content: true,
                senderId: true,
                created_at: true,
              },
            },
          },
          orderBy: { updated_at: "desc" },
        },
      },
      orderBy: { updated_at: "desc" },
    });

    // Calculate ratings and format response
    const calculateAverage = (ratings: { score: number; honest: boolean }[]) => {
      if (ratings.length === 0) return 0;
      const sum = ratings.reduce((acc, r) => acc + r.score, 0);
      return sum / ratings.length;
    };

    const groupedListings = listingsWithChats.map((listing) => {
      const chatsWithRatings = listing.chats.map((chat) => {
        // Get the other user (the interested buyer/seller, not the listing owner)
        const otherUser = chat.participant1Id === userId
          ? chat.participant2
          : chat.participant1;

        const otherUserRatings = otherUser.ratingsReceived;
        const bothLockedIn = chat.participant1LockedIn && chat.participant2LockedIn;

        return {
          ...chat,
          otherUser: {
            id: otherUser.id,
            username: otherUser.username,
            name: otherUser.name,
            image: otherUser.image,
            embark_id: bothLockedIn ? otherUser.embark_id : null,
            discord_username: bothLockedIn ? otherUser.discord_username : null,
            averageRating: calculateAverage(otherUserRatings),
            totalRatings: otherUserRatings.length,
          },
          // Remove full participant data to reduce payload
          participant1: undefined,
          participant2: undefined,
        };
      });

      return {
        listing: {
          id: listing.id,
          type: listing.type,
          status: listing.status,
          quantity: listing.quantity,
          paymentType: listing.paymentType,
          seedsAmount: listing.seedsAmount,
          description: listing.description,
          created_at: listing.created_at,
          item: listing.item,
        },
        interestedCount: listing.chats.length,
        activeChats: chatsWithRatings,
        hasActiveTrader: !!listing.activeTraderChatId,
        activeTraderChatId: listing.activeTraderChatId,
        activeTraderUserId: listing.activeTraderUserId,
      };
    });

    // Also fetch chats where user is NOT the listing owner (incoming chats)
    const incomingChats = await prisma.chat.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
        listing: {
          userId: {
            not: userId,
          },
        },
        status: {
          in: ["ACTIVE", "OWNER_TRADING"],
        },
      },
      select: {
        id: true,
        listingId: true,
        participant1Id: true,
        participant2Id: true,
        participant1LockedIn: true,
        participant2LockedIn: true,
        participant1Approved: true,
        participant2Approved: true,
        status: true,
        created_at: true,
        updated_at: true,
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
            ratingsReceived: {
              select: {
                score: true,
                honest: true,
              },
            },
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
            ratingsReceived: {
              select: {
                score: true,
                honest: true,
              },
            },
          },
        },
        messages: {
          orderBy: { created_at: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            created_at: true,
          },
        },
      },
      orderBy: { updated_at: "desc" },
    });

    // Format incoming chats
    const formattedIncomingChats = incomingChats.map((chat) => {
      const otherUser = chat.participant1Id === userId
        ? chat.participant2
        : chat.participant1;

      const otherUserRatings = otherUser.ratingsReceived;
      const bothLockedIn = chat.participant1LockedIn && chat.participant2LockedIn;

      return {
        ...chat,
        otherUser: {
          id: otherUser.id,
          username: otherUser.username,
          name: otherUser.name,
          image: otherUser.image,
          embark_id: bothLockedIn ? otherUser.embark_id : null,
          discord_username: bothLockedIn ? otherUser.discord_username : null,
          averageRating: calculateAverage(otherUserRatings),
          totalRatings: otherUserRatings.length,
        },
        isActiveTrader: chat.listing.activeTraderChatId === chat.id,
        participant1: undefined,
        participant2: undefined,
      };
    });

    return NextResponse.json({
      ownedListings: groupedListings,
      incomingChats: formattedIncomingChats,
    });
  } catch (error) {
    console.error("Error fetching grouped chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch grouped chats" },
      { status: 500 }
    );
  }
}
