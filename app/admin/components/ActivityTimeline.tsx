"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Loader2, Activity } from "lucide-react";
import { getActivityTypeStyle } from "@/lib/utils/chart-formatters";
import * as LucideIcons from "lucide-react";

interface ActivityLog {
  id: string;
  type: string;
  action: string;
  actionAr: string;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  } | null;
  targetUser: {
    id: string;
    username: string | null;
    name: string | null;
  } | null;
  created_at: string;
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/admin/activity-logs/recent?limit=20");
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activityLogs || []);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-border bg-gradient-to-br from-card to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span>النشاطات الأخيرة</span>
            <span className="text-sm font-normal text-muted-foreground">
              Recent Activity
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            لا توجد نشاطات حديثة (No recent activities)
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const style = getActivityTypeStyle(activity.type);
              const IconComponent = (LucideIcons as any)[style.icon] || Activity;
              const displayName =
                activity.user?.username ||
                activity.user?.name ||
                activity.user?.email ||
                "System";

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
                >
                  {/* Activity Icon */}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${style.bgColor}`}
                  >
                    <IconComponent
                      className="h-5 w-5"
                      style={{ color: style.color }}
                    />
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {activity.user && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={activity.user.image || ""} />
                            <AvatarFallback className="text-xs">
                              {displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {displayName}
                          </span>
                        </div>
                      )}
                      {activity.user?.role === "ADMIN" && (
                        <Badge variant="destructive" className="text-xs">
                          مشرف
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{activity.actionAr}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action}
                    </p>
                    {activity.targetUser && (
                      <p className="text-xs text-muted-foreground">
                        المستخدم المستهدف:{" "}
                        {activity.targetUser.username || activity.targetUser.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
