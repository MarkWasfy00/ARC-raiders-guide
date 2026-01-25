import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { subDays, startOfDay } from "date-fns";

export async function GET(request: Request) {
  // Check staff authorization (admin or moderator)
  const session = await auth();
  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  if (!session?.user?.id || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d

    // Calculate date range
    let days = 30;
    if (period === "7d") days = 7;
    else if (period === "90d") days = 90;

    const endDate = new Date();
    const startDate = startOfDay(subDays(endDate, days));

    // Get listing statistics
    const [
      totalListings,
      activeListings,
      completedListings,
      listingsByType,
      listingsByStatus,
      completedTrades,
      popularItems,
    ] = await Promise.all([
      // Total listings in period
      prisma.listing.count({
        where: {
          created_at: {
            gte: startDate,
          },
        },
      }),

      // Active listings
      prisma.listing.count({
        where: {
          status: "ACTIVE",
          created_at: {
            gte: startDate,
          },
        },
      }),

      // Completed listings
      prisma.listing.count({
        where: {
          status: "COMPLETED",
          created_at: {
            gte: startDate,
          },
        },
      }),

      // Listings by type (WTS/WTB)
      prisma.listing.groupBy({
        by: ["type"],
        where: {
          created_at: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
      }),

      // Listings by status
      prisma.listing.groupBy({
        by: ["status"],
        where: {
          created_at: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
      }),

      // Completed trades
      prisma.trade.count({
        where: {
          status: "COMPLETED",
          created_at: {
            gte: startDate,
          },
        },
      }),

      // Most popular items (top 10)
      prisma.listing.groupBy({
        by: ["itemId"],
        where: {
          created_at: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 10,
      }),
    ]);

    // Get item details for popular items
    const itemIds = popularItems.map((item) => item.itemId);
    const items = await prisma.item.findMany({
      where: {
        id: {
          in: itemIds,
        },
      },
      select: {
        id: true,
        name: true,
        icon: true,
        rarity: true,
      },
    });

    const popularItemsWithDetails = popularItems.map((item) => {
      const itemDetail = items.find((i) => i.id === item.itemId);
      return {
        itemId: item.itemId,
        name: itemDetail?.name || "Unknown",
        icon: itemDetail?.icon,
        rarity: itemDetail?.rarity,
        listingCount: item._count.id,
      };
    });

    // Calculate metrics
    const completionRate =
      totalListings > 0
        ? Math.round((completedListings / totalListings) * 100)
        : 0;

    const avgTradesPerDay = Math.round(completedTrades / days);

    return NextResponse.json({
      period,
      metrics: {
        totalListings,
        activeListings,
        completedListings,
        completionRate,
        completedTrades,
        avgTradesPerDay,
      },
      listingsByType: listingsByType.map((item) => ({
        type: item.type,
        typeLabel: item.type === "WTS" ? "للبيع (WTS)" : "للشراء (WTB)",
        count: item._count.id,
      })),
      listingsByStatus: listingsByStatus.map((item) => ({
        status: item.status,
        statusLabel:
          item.status === "ACTIVE"
            ? "نشط"
            : item.status === "COMPLETED"
            ? "مكتمل"
            : "ملغي",
        count: item._count.id,
      })),
      popularItems: popularItemsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching marketplace analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
