"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "./components/StatsCard";
import { ActivityTimeline } from "./components/ActivityTimeline";
import { TopUsersWidget } from "./components/TopUsersWidget";
import { QuickActionsPanel } from "./components/QuickActionsPanel";
import { AreaChart } from "./components/charts/AreaChart";
import { BarChart } from "./components/charts/BarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  ShoppingCart,
  MessageSquare,
  Activity,
  Handshake,
  TrendingUp,
} from "lucide-react";
import { Loader2 } from "lucide-react";

interface AdminStats {
  connectedUsers: number;
  totalUsers: number;
  totalMarkers: number;
  totalListings: number;
  totalChats: number;
}

interface AnalyticsData {
  data: { date: string; value: number }[];
}

interface MarketplaceData {
  metrics: {
    totalListings: number;
    activeListings: number;
    completedListings: number;
    completionRate: number;
    completedTrades: number;
    avgTradesPerDay: number;
  };
  listingsByStatus: { status: string; statusLabel: string; count: number }[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<AnalyticsData | null>(null);
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch basic stats
        const statsResponse = await fetch("/api/admin/stats");
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }

        // Fetch user growth data
        const userGrowthResponse = await fetch(
          "/api/admin/analytics/user-growth?period=30d"
        );
        if (userGrowthResponse.ok) {
          const growthData = await userGrowthResponse.json();
          setUserGrowthData(growthData);
        }

        // Fetch marketplace data
        const marketplaceResponse = await fetch(
          "/api/admin/analytics/marketplace?period=30d"
        );
        if (marketplaceResponse.ok) {
          const marketData = await marketplaceResponse.json();
          setMarketplaceData(marketData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    // Refresh stats every 10 seconds
    const interval = setInterval(async () => {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-4xl font-bold text-transparent">
            لوحة التحكم الرئيسية
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Admin Dashboard - Real-time Analytics & Insights
          </p>
        </div>
        <QuickActionsPanel />
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Connected Users"
          titleAr="المستخدمين المتصلين"
          value={stats?.connectedUsers || 0}
          icon={Activity}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
        />
        <StatsCard
          title="Total Users"
          titleAr="إجمالي المستخدمين"
          value={stats?.totalUsers || 0}
          icon={Users}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />
        <StatsCard
          title="Active Listings"
          titleAr="الإعلانات النشطة"
          value={marketplaceData?.metrics.activeListings || stats?.totalListings || 0}
          icon={ShoppingCart}
          iconColor="text-green-500"
          iconBgColor="bg-green-500/10"
        />
        <StatsCard
          title="Total Chats"
          titleAr="إجمالي المحادثات"
          value={stats?.totalChats || 0}
          icon={MessageSquare}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card className="border-border bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span>نمو المستخدمين</span>
                <span className="text-sm font-normal text-muted-foreground">
                  User Growth (Last 30 Days)
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userGrowthData && userGrowthData.data.length > 0 ? (
              <AreaChart
                data={userGrowthData.data}
                height={250}
                isRTL={true}
              />
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                لا توجد بيانات (No data available)
              </div>
            )}
          </CardContent>
        </Card>

        {/* Marketplace Activity Chart */}
        <Card className="border-border bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-green-500" />
              <div className="flex flex-col">
                <span>نشاط السوق</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Marketplace Activity
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {marketplaceData && marketplaceData.listingsByStatus.length > 0 ? (
              <BarChart
                data={marketplaceData.listingsByStatus.map((item) => ({
                  label: item.statusLabel,
                  value: item.count,
                }))}
                height={250}
                isRTL={true}
              />
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                لا توجد بيانات (No data available)
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Activity Timeline and Top Users */}
      <div className="grid gap-6 md:grid-cols-2">
        <ActivityTimeline />
        <TopUsersWidget />
      </div>

      {/* Additional Metrics Cards */}
      {marketplaceData && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Completed Trades"
            titleAr="الصفقات المكتملة"
            value={marketplaceData.metrics.completedTrades}
            icon={Handshake}
            iconColor="text-green-500"
            iconBgColor="bg-green-500/10"
          />
          <StatsCard
            title="Completed Listings"
            titleAr="الإعلانات المكتملة"
            value={marketplaceData.metrics.completedListings}
            icon={ShoppingCart}
            iconColor="text-blue-500"
            iconBgColor="bg-blue-500/10"
          />
          <StatsCard
            title="Completion Rate"
            titleAr="معدل الإكمال"
            value={marketplaceData.metrics.completionRate}
            icon={TrendingUp}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
            valueFormatter={(value) => `${value}%`}
          />
        </div>
      )}
    </div>
  );
}
