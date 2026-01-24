import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { subDays, format, startOfDay } from "date-fns";

export async function GET(request: Request) {
  // Check staff authorization (admin or moderator)
  const session = await auth();
  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  if (!session?.user?.id || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7d"; // 7d, 30d, 90d
    const metric = searchParams.get("metric") || "users"; // users, listings, chats, trades

    // Calculate date range
    let days = 7;
    if (period === "30d") days = 30;
    else if (period === "90d") days = 90;

    const endDate = new Date();
    const startDate = startOfDay(subDays(endDate, days));

    let data: { date: string; value: number }[] = [];

    switch (metric) {
      case "users": {
        // Daily new user registrations
        const users = await prisma.user.groupBy({
          by: ["createdAt"],
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          _count: {
            id: true,
          },
        });

        // Group by day
        const dailyCounts: Record<string, number> = {};
        users.forEach((user) => {
          const day = format(startOfDay(user.createdAt), "yyyy-MM-dd");
          dailyCounts[day] = (dailyCounts[day] || 0) + user._count.id;
        });

        // Fill in missing days with 0
        for (let i = 0; i < days; i++) {
          const date = format(subDays(endDate, i), "yyyy-MM-dd");
          data.push({
            date,
            value: dailyCounts[date] || 0,
          });
        }

        data.reverse();
        break;
      }

      case "listings": {
        // Daily new listings
        const listings = await prisma.listing.groupBy({
          by: ["created_at"],
          where: {
            created_at: {
              gte: startDate,
            },
          },
          _count: {
            id: true,
          },
        });

        const dailyCounts: Record<string, number> = {};
        listings.forEach((listing) => {
          const day = format(startOfDay(listing.created_at), "yyyy-MM-dd");
          dailyCounts[day] = (dailyCounts[day] || 0) + listing._count.id;
        });

        for (let i = 0; i < days; i++) {
          const date = format(subDays(endDate, i), "yyyy-MM-dd");
          data.push({
            date,
            value: dailyCounts[date] || 0,
          });
        }

        data.reverse();
        break;
      }

      case "chats": {
        // Daily new chats
        const chats = await prisma.chat.groupBy({
          by: ["created_at"],
          where: {
            created_at: {
              gte: startDate,
            },
          },
          _count: {
            id: true,
          },
        });

        const dailyCounts: Record<string, number> = {};
        chats.forEach((chat) => {
          const day = format(startOfDay(chat.created_at), "yyyy-MM-dd");
          dailyCounts[day] = (dailyCounts[day] || 0) + chat._count.id;
        });

        for (let i = 0; i < days; i++) {
          const date = format(subDays(endDate, i), "yyyy-MM-dd");
          data.push({
            date,
            value: dailyCounts[date] || 0,
          });
        }

        data.reverse();
        break;
      }

      case "trades": {
        // Daily completed trades
        const trades = await prisma.trade.groupBy({
          by: ["created_at"],
          where: {
            created_at: {
              gte: startDate,
            },
            status: "COMPLETED",
          },
          _count: {
            id: true,
          },
        });

        const dailyCounts: Record<string, number> = {};
        trades.forEach((trade) => {
          const day = format(startOfDay(trade.created_at), "yyyy-MM-dd");
          dailyCounts[day] = (dailyCounts[day] || 0) + trade._count.id;
        });

        for (let i = 0; i < days; i++) {
          const date = format(subDays(endDate, i), "yyyy-MM-dd");
          data.push({
            date,
            value: dailyCounts[date] || 0,
          });
        }

        data.reverse();
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid metric parameter" },
          { status: 400 }
        );
    }

    return NextResponse.json({ data, period, metric });
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
