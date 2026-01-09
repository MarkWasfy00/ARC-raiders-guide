import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logListingCreated } from "@/lib/services/activity-logger";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as "WTS" | "WTB" | null;

    const listings = await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        ...(type && { type }),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            embark_id: true,
            discord_username: true,
            createdAt: true,
            ratingsReceived: {
              select: {
                score: true,
                honest: true,
              },
            },
          },
        },
        item: {
          select: {
            id: true,
            name: true,
            icon: true,
            rarity: true,
            item_type: true,
          },
        },
        paymentItems: {
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
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Calculate user ratings
    const listingsWithRatings = listings.map((listing) => {
      const ratings = listing.user.ratingsReceived;
      const totalRatings = ratings.length;
      const averageRating =
        totalRatings > 0
          ? ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings
          : 0;
      const honestTradesCount = ratings.filter((r) => r.honest).length;

      const { ratingsReceived, ...userWithoutRatings } = listing.user;

      return {
        ...listing,
        user: {
          ...userWithoutRatings,
          averageRating: Number(averageRating.toFixed(1)),
          totalRatings,
          honestTradesCount,
        },
      };
    });

    return NextResponse.json({ listings: listingsWithRatings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    // Check if user has Discord and Embark ID set
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { discord_username: true, embark_id: true },
    });

    if (!user?.discord_username || !user?.embark_id) {
      return NextResponse.json(
        { error: "يجب إضافة معرف Discord و Embark ID في ملفك الشخصي قبل إنشاء قائمة" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      type,
      itemId,
      quantity,
      paymentType,
      seedsAmount,
      description,
      paymentItems,
    } = body;

    // Validate required fields
    if (!type || !itemId || !quantity || !paymentType || !description) {
      console.log("Missing required fields:", { type, itemId, quantity, paymentType, description });
      return NextResponse.json(
        { error: "الحقول المطلوبة ناقصة" },
        { status: 400 }
      );
    }

    // Validate payment type specific fields
    if (paymentType === "SEEDS" && !seedsAmount) {
      return NextResponse.json(
        { error: "يجب تحديد عدد البذور المطلوبة" },
        { status: 400 }
      );
    }

    if (paymentType === "ITEMS" && (!paymentItems || paymentItems.length === 0)) {
      return NextResponse.json(
        { error: "يجب إضافة العناصر المطلوبة" },
        { status: 400 }
      );
    }

    console.log("Creating listing with data:", {
      type,
      userId: session.user.id,
      itemId,
      quantity,
      paymentType,
      seedsAmount,
      description,
      paymentItemsCount: paymentItems?.length || 0,
    });

    // Create the listing
    const listing = await prisma.listing.create({
      data: {
        type,
        userId: session.user.id,
        itemId,
        quantity: parseInt(quantity),
        paymentType,
        seedsAmount: seedsAmount ? parseInt(seedsAmount) : null,
        description,
        paymentItems: {
          create: paymentItems?.map((item: { itemId: string; quantity: number }) => ({
            itemId: item.itemId,
            quantity: parseInt(item.quantity.toString()),
          })) || [],
        },
      },
      include: {
        item: true,
        paymentItems: {
          include: {
            item: true,
          },
        },
      },
    });

    console.log("Listing created successfully:", listing.id);

    // Log listing creation
    await logListingCreated(
      session.user.id,
      listing.id,
      listing.type
    );

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: `فشل في إنشاء القائمة: ${errorMessage}` },
      { status: 500 }
    );
  }
}
