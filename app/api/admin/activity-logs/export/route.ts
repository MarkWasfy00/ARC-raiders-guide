import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ActivityType, Prisma } from "@/lib/generated/prisma/client";
import Papa from "papaparse";

export async function GET(request: Request) {
  // Check staff authorization (admin or moderator)
  const session = await auth();
  const isStaff = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
  if (!session?.user?.id || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const userId = searchParams.get("userId") || "";

    // Build where clause
    const where: Prisma.ActivityLogWhereInput = {};

    // Filter by activity type
    if (type && type !== "all") {
      where.type = type as ActivityType;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.created_at.lte = end;
      }
    }

    // Filter by user
    if (userId) {
      where.userId = userId;
    }

    // Search in action text or user info
    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { actionAr: { contains: search, mode: "insensitive" } },
        { user: { username: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { targetUser: { username: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Fetch activity logs
    const activityLogs = await prisma.activityLog.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        targetUser: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    // Transform data for CSV
    const csvData = activityLogs.map((log) => ({
      ID: log.id,
      Type: log.type,
      "Action (EN)": log.action,
      "Action (AR)": log.actionAr,
      "User Username": log.user?.username || "",
      "User Email": log.user?.email || "",
      "Target Username": log.targetUser?.username || "",
      "Target Email": log.targetUser?.email || "",
      "Related Entity ID": log.relatedEntityId || "",
      "Related Entity Type": log.relatedEntityType || "",
      "IP Address": log.ipAddress || "",
      "User Agent": log.userAgent || "",
      Metadata: log.metadata ? JSON.stringify(log.metadata) : "",
      "Created At": log.created_at.toISOString(),
    }));

    // Generate CSV
    const csv = Papa.unparse(csvData);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="activity-logs-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting activity logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
