import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { subDays, format, startOfDay } from "date-fns";

export async function GET(request: Request) {
  // Check admin authorization
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
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

    // Get all users created within the period
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by day and calculate cumulative count
    const dailyCounts: Record<string, number> = {};
    users.forEach((user) => {
      const day = format(startOfDay(user.createdAt), "yyyy-MM-dd");
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    // Get total users before the period
    const totalUsersBefore = await prisma.user.count({
      where: {
        createdAt: {
          lt: startDate,
        },
      },
    });

    // Build cumulative data array
    const data: { date: string; value: number; newUsers: number }[] = [];
    let cumulativeCount = totalUsersBefore;

    for (let i = 0; i < days; i++) {
      const date = format(subDays(endDate, days - 1 - i), "yyyy-MM-dd");
      const newUsers = dailyCounts[date] || 0;
      cumulativeCount += newUsers;

      data.push({
        date,
        value: cumulativeCount,
        newUsers,
      });
    }

    // Calculate growth metrics
    const currentTotal = cumulativeCount;
    const previousTotal = totalUsersBefore + (dailyCounts[data[0]?.date] || 0);
    const growthPercentage =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    return NextResponse.json({
      data,
      period,
      metrics: {
        totalUsers: currentTotal,
        newUsers: currentTotal - totalUsersBefore,
        growthPercentage: Math.round(growthPercentage * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Error fetching user growth analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
