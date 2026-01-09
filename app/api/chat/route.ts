import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch user's chats
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id },
        ],
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
        messages: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
      },
      orderBy: { updated_at: "desc" },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

// POST - Create or get existing chat
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId, otherUserId } = await req.json();

    if (!listingId || !otherUserId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has completed their profile (Discord and Embark ID)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        discord_username: true,
        embark_id: true,
      },
    });

    if (!currentUser?.discord_username || !currentUser?.embark_id) {
      return NextResponse.json(
        { error: "Please complete your profile with Discord username and Embark ID before starting a chat" },
        { status: 400 }
      );
    }

    // Check if chat already exists (order-independent)
    let chat = await prisma.chat.findFirst({
      where: {
        listingId,
        OR: [
          {
            participant1Id: session.user.id,
            participant2Id: otherUserId,
          },
          {
            participant1Id: otherUserId,
            participant2Id: session.user.id,
          },
        ],
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
          orderBy: { created_at: "asc" },
          include: {
            sender: {
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

    // If chat doesn't exist, create it
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          listingId,
          participant1Id: session.user.id,
          participant2Id: otherUserId,
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
            orderBy: { created_at: "asc" },
            include: {
              sender: {
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
    }

    // Calculate ratings for participants
    const participant1Ratings = chat.participant1.ratingsReceived;
    const participant2Ratings = chat.participant2.ratingsReceived;

    const calculateAverage = (ratings: any[]) => {
      if (ratings.length === 0) return 0;
      const sum = ratings.reduce((acc, r) => acc + r.score, 0);
      return sum / ratings.length;
    };

    // Check if both participants have locked in
    const bothLockedIn = chat.participant1LockedIn && chat.participant2LockedIn;

    const chatWithRatings = {
      ...chat,
      participant1: {
        ...chat.participant1,
        embark_id: bothLockedIn ? chat.participant1.embark_id : null,
        averageRating: calculateAverage(participant1Ratings),
        totalRatings: participant1Ratings.length,
        ratingsReceived: undefined,
      },
      participant2: {
        ...chat.participant2,
        embark_id: bothLockedIn ? chat.participant2.embark_id : null,
        averageRating: calculateAverage(participant2Ratings),
        totalRatings: participant2Ratings.length,
        ratingsReceived: undefined,
      },
    };

    return NextResponse.json(chatWithRatings);
  } catch (error) {
    console.error("Error creating/fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to create or fetch chat" },
      { status: 500 }
    );
  }
}
