'use client';

import dynamic from 'next/dynamic';
import { Map, Crosshair, Navigation } from 'lucide-react';

// Dynamically import the map component to avoid SSR issues with Leaflet
const BuriedCityMapClient = dynamic(
  () => import('@/app/features/maps/components/BuriedCityMapClient').then((mod) => mod.BuriedCityMapClient),
  { ssr: false }
);

export function BuriedCityClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section */}
      <div className="relative border-b border-border/50 bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-6 py-6 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shadow-lg">
              <Map className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-1">
                المدينة المدفونة
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Buried City
              </p>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Navigation className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">التحكم</p>
                <p className="text-sm font-semibold">تكبير / تحريك الخريطة</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Crosshair className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">التفاعل</p>
                <p className="text-sm font-semibold">انقر على العلامات</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Map className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">الفلاتر</p>
                <p className="text-sm font-semibold">استخدم الشريط الجانبي</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="container mx-auto px-6 py-6">
        <div className="relative">
          {/* Decorative corner accents */}
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-primary/30 rounded-tl-lg z-10" />
          <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-lg z-10" />
          <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-primary/30 rounded-bl-lg z-10" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-primary/30 rounded-br-lg z-10" />

          <BuriedCityMapClient />
        </div>
      </div>

      {/* Footer Info */}
      <div className="container mx-auto px-6 pb-6">
        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
          <p className="text-xs text-muted-foreground text-center">
            💡 <span className="font-medium">نصيحة:</span> استخدم عجلة الماوس للتكبير والتصغير، واسحب الخريطة للتنقل بين المواقع المختلفة
          </p>
        </div>
      </div>
    </div>
  );
}
