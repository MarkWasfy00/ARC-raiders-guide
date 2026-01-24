import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Check staff authorization (admin or moderator)
  const session = await auth();
  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  if (!session?.user?.id || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get("metric") || "listings"; // listings, trades, messages
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let topUsers: any[] = [];

    switch (metric) {
      case "listings": {
        // Top users by number of listings
        topUsers = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            image: true,
            role: true,
            _count: {
              select: {
                listings: true,
              },
            },
          },
          orderBy: {
            listings: {
              _count: "desc",
            },
          },
          take: limit,
          where: {
            listings: {
              some: {},
            },
          },
        });

        topUsers = topUsers.map((user) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          count: user._count.listings,
          metric: "listings",
          metricLabel: "إعلانات",
        }));
        break;
      }

      case "trades": {
        // Top users by number of completed trades (buyer + seller)
        const usersAsBuyers = await prisma.user.findMany({
          select: {
            id: true,
            _count: {
              select: {
                tradesAsBuyer: {
                  where: {
                    status: "COMPLETED",
                  },
                },
              },
            },
          },
          where: {
            tradesAsBuyer: {
              some: {
                status: "COMPLETED",
              },
            },
          },
        });

        const usersAsSellers = await prisma.user.findMany({
          select: {
            id: true,
            _count: {
              select: {
                tradesAsSeller: {
                  where: {
                    status: "COMPLETED",
                  },
                },
              },
            },
          },
          where: {
            tradesAsSeller: {
              some: {
                status: "COMPLETED",
              },
            },
          },
        });

        // Combine buyer and seller trades
        const tradeCounts: Record<string, number> = {};
        usersAsBuyers.forEach((user) => {
          tradeCounts[user.id] =
            (tradeCounts[user.id] || 0) + user._count.tradesAsBuyer;
        });
        usersAsSellers.forEach((user) => {
          tradeCounts[user.id] =
            (tradeCounts[user.id] || 0) + user._count.tradesAsSeller;
        });

        // Sort by trade count and get top users
        const topUserIds = Object.entries(tradeCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([userId]) => userId);

        const users = await prisma.user.findMany({
          where: {
            id: {
              in: topUserIds,
            },
          },
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        });

        topUsers = users.map((user) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          count: tradeCounts[user.id] || 0,
          metric: "trades",
          metricLabel: "صفقات",
        }));

        topUsers.sort((a, b) => b.count - a.count);
        break;
      }

      case "messages": {
        // Top users by number of messages sent
        topUsers = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            image: true,
            role: true,
            _count: {
              select: {
                messages: true,
              },
            },
          },
          orderBy: {
            messages: {
              _count: "desc",
            },
          },
          take: limit,
          where: {
            messages: {
              some: {},
            },
          },
        });

        topUsers = topUsers.map((user) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          count: user._count.messages,
          metric: "messages",
          metricLabel: "رسائل",
        }));
        break;
      }

      case "guides": {
        // Top users by number of guides created
        topUsers = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            image: true,
            role: true,
            _count: {
              select: {
                guides: true,
              },
            },
          },
          orderBy: {
            guides: {
              _count: "desc",
            },
          },
          take: limit,
          where: {
            guides: {
              some: {},
            },
          },
        });

        topUsers = topUsers.map((user) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          count: user._count.guides,
          metric: "guides",
          metricLabel: "أدلة",
        }));
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid metric parameter" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      metric,
      limit,
      users: topUsers,
    });
  } catch (error) {
    console.error("Error fetching top users analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
