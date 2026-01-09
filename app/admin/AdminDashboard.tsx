'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, MapPin, ShoppingCart, MessageSquare, Activity } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface AdminStats {
  connectedUsers: number;
  totalUsers: number;
  totalMarkers: number;
  totalListings: number;
  totalChats: number;
  markersByMap: { map: string; count: number }[];
  listingsByStatus: { status: string; count: number }[];
  recentUsers: {
    id: string;
    username: string | null;
    email: string | null;
    image: string | null;
    createdAt: Date;
  }[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);

    return () => clearInterval(interval);
  }, []);

  const mapNames: Record<string, string> = {
    'buried-city': 'المدينة المدفونة',
    'dam': 'سد المعركة',
    'spaceport': 'الميناء الفضائي',
    'stella-montis': 'ستيلا مونتيس',
  };

  const statusNames: Record<string, string> = {
    ACTIVE: 'نشط',
    SOLD: 'مُباع',
    CLOSED: 'مُغلق',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 border border-destructive/30 shadow-lg">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-destructive via-destructive/80 to-destructive/60 bg-clip-text text-transparent mb-1">
                  لوحة التحكم الرئيسية
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Admin Dashboard
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/guides">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  إدارة الأدلة →
                </Badge>
              </Link>
              <Link href="/admin/maps">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  إدارة الخرائط →
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Real-time Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستخدمين المتصلين</CardTitle>
              <Activity className="h-4 w-4 text-primary animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats?.connectedUsers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">اتصالات WebSocket نشطة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">مستخدم مسجل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">علامات الخرائط</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalMarkers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">علامة على جميع الخرائط</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قوائم السوق</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalListings || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">إعلان نشط</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Markers by Map */}
          <Card>
            <CardHeader>
              <CardTitle>العلامات حسب الخريطة</CardTitle>
              <CardDescription>توزيع العلامات على الخرائط المختلفة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.markersByMap.map((map) => (
                  <div key={map.map} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {mapNames[map.map] || map.map}
                      </span>
                    </div>
                    <Badge variant="secondary">{map.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Listings by Status */}
          <Card>
            <CardHeader>
              <CardTitle>الإعلانات حسب الحالة</CardTitle>
              <CardDescription>حالة إعلانات السوق</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.listingsByStatus.map((listing) => (
                  <div key={listing.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {statusNames[listing.status] || listing.status}
                      </span>
                    </div>
                    <Badge variant="secondary">{listing.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>المستخدمون الجدد</CardTitle>
            <CardDescription>آخر المستخدمين المسجلين</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback>
                      {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.username || user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
