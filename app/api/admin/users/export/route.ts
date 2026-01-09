import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Papa from "papaparse";

export async function GET(request: Request) {
  // Check admin authorization
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const banned = searchParams.get("banned");
    const role = searchParams.get("role");

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { embark_id: { contains: search, mode: "insensitive" } },
      ];
    }

    if (banned === "true") {
      where.banned = true;
    } else if (banned === "false") {
      where.banned = false;
    }

    if (role && ["USER", "ADMIN"].includes(role)) {
      where.role = role;
    }

    // Fetch users with aggregated counts
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        embark_id: true,
        discord_username: true,
        role: true,
        banned: true,
        bannedAt: true,
        banReason: true,
        lastLoginAt: true,
        loginCount: true,
        lastActivityAt: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            tradesAsBuyer: true,
            tradesAsSeller: true,
            messages: true,
            guides: true,
            mapMarkers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data for CSV
    const csvData = users.map((user) => ({
      ID: user.id,
      Username: user.username || "",
      Name: user.name || "",
      Email: user.email || "",
      "Embark ID": user.embark_id || "",
      "Discord Username": user.discord_username || "",
      Role: user.role,
      Banned: user.banned ? "Yes" : "No",
      "Banned At": user.bannedAt ? user.bannedAt.toISOString() : "",
      "Ban Reason": user.banReason || "",
      "Last Login": user.lastLoginAt ? user.lastLoginAt.toISOString() : "",
      "Login Count": user.loginCount,
      "Last Activity": user.lastActivityAt ? user.lastActivityAt.toISOString() : "",
      "Registered At": user.createdAt.toISOString(),
      "Listings Count": user._count.listings,
      "Trades as Buyer": user._count.tradesAsBuyer,
      "Trades as Seller": user._count.tradesAsSeller,
      "Total Trades": user._count.tradesAsBuyer + user._count.tradesAsSeller,
      "Messages Count": user._count.messages,
      "Guides Count": user._count.guides,
      "Map Markers Count": user._count.mapMarkers,
    }));

    // Generate CSV
    const csv = Papa.unparse(csvData);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
