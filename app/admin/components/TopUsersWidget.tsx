"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trophy, ShoppingCart, Handshake, MessageSquare, BookOpen } from "lucide-react";
import { formatArabicNumbers } from "@/lib/utils/chart-formatters";
import Link from "next/link";

interface TopUser {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  count: number;
  metric: string;
  metricLabel: string;
}

interface TopUsersData {
  users: TopUser[];
}

export function TopUsersWidget() {
  const [activeTab, setActiveTab] = useState<string>("listings");
  const [users, setUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopUsers = async (metric: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/analytics/top-users?metric=${metric}&limit=10`
      );
      if (response.ok) {
        const data: TopUsersData = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch top users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopUsers(activeTab);
  }, [activeTab]);

  const tabs = [
    { value: "listings", label: "إعلانات", labelEn: "Listings", icon: ShoppingCart },
    { value: "trades", label: "صفقات", labelEn: "Trades", icon: Handshake },
    { value: "messages", label: "رسائل", labelEn: "Messages", icon: MessageSquare },
    { value: "guides", label: "أدلة", labelEn: "Guides", icon: BookOpen },
  ];

  return (
    <Card className="border-border bg-gradient-to-br from-card to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <div className="flex flex-col">
            <span>المستخدمون الأكثر نشاطاً</span>
            <span className="text-sm font-normal text-muted-foreground">
              Top Active Users
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex flex-col gap-1"
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-xs">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  لا توجد بيانات (No data available)
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user, index) => {
                    const displayName =
                      user.username || user.name || user.email || "Unknown";
                    return (
                      <Link
                        key={user.id}
                        href={`/admin/users?search=${user.id}`}
                        className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
                      >
                        {/* Rank Badge */}
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-white">
                          {formatArabicNumbers(index + 1)}
                        </div>

                        {/* User Avatar */}
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback>
                            {displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {displayName}
                            </span>
                            {user.role === "ADMIN" && (
                              <Badge variant="destructive" className="text-xs">
                                مشرف
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {user.metricLabel}: {formatArabicNumbers(user.count)}
                          </p>
                        </div>

                        {/* Count Badge */}
                        <div className="flex h-8 items-center rounded-full bg-primary/10 px-3">
                          <span className="text-sm font-semibold text-primary">
                            {formatArabicNumbers(user.count)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
