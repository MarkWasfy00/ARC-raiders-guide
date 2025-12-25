'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface MapIframeProps {
  src: string;
  title: string;
  mapName: string;
}

export function MapIframe({ src, title, mapName }: MapIframeProps) {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            العودة إلى لوحة التحكم
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {mapName}
          </h1>
          <p className="text-muted-foreground">
            استكشف الخريطة التفاعلية بالكامل مع جميع المواقع والموارد
          </p>
        </div>

        {/* Interactive Map Container */}
        <div className="relative rounded-lg border border-border bg-card shadow-card overflow-hidden">
          {/* Top bar with branding */}
          <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-foreground">
                خريطة تفاعلية
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-muted" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted" />
            </div>
          </div>

          {/* Iframe wrapper with theme-matched border */}
          <div className="relative bg-background-elevated">
            <iframe
              src={src}
              title={title}
              className="w-full border-0 relative z-10"
              style={{ height: '600px', minHeight: '500px' }}
              allowFullScreen
            />
          </div>

          {/* Bottom bar with info */}
          <div className="bg-card border-t border-border px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs text-muted-foreground">
                استخدم الفأرة للتنقل والتكبير والتصغير
              </p>
              <a
                href={src.replace('?embed=light', '')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                فتح في نافذة جديدة
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-lg">📍</span>
            </div>
            <h3 className="font-semibold text-foreground">المواقع</h3>
            <p className="text-sm text-muted-foreground">
              اكتشف جميع المواقع المهمة والنقاط المرجعية
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-lg">💎</span>
            </div>
            <h3 className="font-semibold text-foreground">الموارد</h3>
            <p className="text-sm text-muted-foreground">
              تعرف على مواقع الموارد القيمة والغنائم
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-lg">⚔️</span>
            </div>
            <h3 className="font-semibold text-foreground">نقاط الاهتمام</h3>
            <p className="text-sm text-muted-foreground">
              ابحث عن نقاط الاهتمام الاستراتيجية في الخريطة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
