import Link from 'next/link';
import Image from 'next/image';
import { ExploreRaiders } from './features/explore-raiders';
import { Maps } from './features/maps';
import { Items } from './features/items';
import { RecentBlogs } from './features/blog';
import { StructuredData, getBreadcrumbSchema } from '@/components/StructuredData';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Enable ISR - revalidate every 60 seconds for fresh content
export const revalidate = 60;

export default function Home() {
  return (
    <main className="min-h-screen">
      <StructuredData
        data={getBreadcrumbSchema(baseUrl, [
          { name: 'الرئيسية', url: '/' },
        ])}
      />
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Banner */}
        <div className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl group">
          <Image
            src="/banner/banner.jpg"
            alt="Arc Raiders"
            fill
            className="object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
            priority
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

          {/* Animated Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Content */}
          <div className="relative h-full flex flex-col justify-center px-8 md:px-12">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 backdrop-blur-sm">
                <span className="text-xs md:text-sm font-semibold text-orange-400 uppercase tracking-wider">
                  🎮 دليل ARC Raiders الشامل
                </span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-l from-orange-400 via-red-400 to-orange-300 bg-clip-text text-transparent drop-shadow-2xl">
                3RB
              </h1>

              <p className="text-lg md:text-xl text-gray-200 max-w-xl leading-relaxed drop-shadow-lg">
                مركزك الشامل لعالم ARC Raiders - قاعدة بيانات، أدلة، خرائط، وأدوات احترافية
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <div className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                  <span className="text-sm text-gray-200">📊 قاعدة البيانات</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                  <span className="text-sm text-gray-200">🗺️ الخرائط</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                  <span className="text-sm text-gray-200">💬 المجتمع</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Explore Arc Raiders */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">استكشف آرك رايدرز</h2>
          <ExploreRaiders />
        </section>

        {/* ARC Raiders Maps */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">خرائط آرك رايدرز</h2>
          <Maps />
        </section>

        {/* ARC Raiders Items */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">عناصر آرك رايدرز</h2>
            <Link
              href="/items"
              className="text-sm hover:underline transition-colors"
            >
              عرض جميع العناصر ←
            </Link>
          </div>
          <Items />
        </section>

        {/* News & Guides */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">الأخبار والأدلة</h2>
            <Link
              href="/blogs"
              className="text-sm hover:underline transition-colors"
            >
              عرض جميع المقالات ←
            </Link>
          </div>
          <RecentBlogs limit={8} />
        </section>
      </div>
    </main>
  );
}
