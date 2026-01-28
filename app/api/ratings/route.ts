import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Submit rating for completed trade
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tradeId, score, honest, comment } = await req.json();

    // Validate inputs
    if (!tradeId || !score || typeof honest !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (score < 1 || score > 5) {
      return NextResponse.json(
        { error: "Score must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Fetch trade and verify user is a participant
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { listing: true },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    const isParticipant =
      trade.buyerId === session.user.id || trade.sellerId === session.user.id;

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Not a trade participant" },
        { status: 403 }
      );
    }

    // Determine who is being rated
    const toUserId =
      trade.buyerId === session.user.id ? trade.sellerId : trade.buyerId;

    // Check if this user has already rated this trade
    const existingRating = await prisma.rating.findUnique({
      where: {
        tradeId_fromUserId: {
          tradeId,
          fromUserId: session.user.id,
        },
      },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: "لقد قمت بتقييم هذه الصفقة مسبقاً" },
        { status: 409 }
      );
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        tradeId,
        fromUserId: session.user.id,
        toUserId,
        score,
        honest,
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true, rating });
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
