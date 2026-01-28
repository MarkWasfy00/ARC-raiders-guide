import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logListingCreated } from "@/lib/services/activity-logger";
import { cache, cacheKeys } from "@/lib/redis";
import { checkApiRateLimit } from "@/lib/api-utils";

// Cache TTL: 1 minute (listings change frequently)
const CACHE_TTL = 60;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as "WTS" | "WTB" | null;

    // Create cache key based on filter
    const cacheKey = cacheKeys.listings(type || "all");

    // Try Redis cache first
    const cachedData = await cache.get<{ listings: unknown[]; fetchedAt: number }>(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        listings: cachedData.listings,
        cached: true,
        cacheAge: Math.floor((Date.now() - cachedData.fetchedAt) / 1000),
      });
    }

    // Get unique user IDs first to batch rating aggregations
    const listings = await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        ...(type && { type }),
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
        updated_at: true,
        userId: true,
        itemId: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            embark_id: true,
            discord_username: true,
            createdAt: true,
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
          select: {
            id: true,
            quantity: true,
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

    // Get unique user IDs from listings
    const userIds = [...new Set(listings.map((l) => l.user.id))];

    // Batch fetch rating aggregations for all users in one query
    const userRatings = await prisma.rating.groupBy({
      by: ["toUserId"],
      where: {
        toUserId: { in: userIds },
      },
      _count: { id: true },
      _avg: { score: true },
    });

    // Batch fetch honest trade counts
    const honestCounts = await prisma.rating.groupBy({
      by: ["toUserId"],
      where: {
        toUserId: { in: userIds },
        honest: true,
      },
      _count: { id: true },
    });

    // Create lookup maps for O(1) access
    const ratingsMap = new Map(
      userRatings.map((r) => [
        r.toUserId,
        { count: r._count.id, avg: r._avg.score || 0 },
      ])
    );
    const honestMap = new Map(
      honestCounts.map((h) => [h.toUserId, h._count.id])
    );

    // Transform listings with pre-computed ratings
    const listingsWithRatings = listings.map((listing) => {
      const userRating = ratingsMap.get(listing.user.id);
      const honestCount = honestMap.get(listing.user.id) || 0;

      return {
        ...listing,
        user: {
          ...listing.user,
          averageRating: Number((userRating?.avg || 0).toFixed(1)),
          totalRatings: userRating?.count || 0,
          honestTradesCount: honestCount,
        },
      };
    });

    // Store in Redis
    await cache.set(cacheKey, {
      listings: listingsWithRatings,
      fetchedAt: Date.now(),
    }, CACHE_TTL);

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
  // Check rate limit
  const rateLimitResponse = await checkApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

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

    // Invalidate listings cache after creating new listing
    await cache.delPattern("listings:*");

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
