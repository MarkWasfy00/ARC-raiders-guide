import Link from 'next/link';
import Image from 'next/image';
import { ExploreRaiders } from './features/explore-raiders';
import { Maps } from './features/maps';
import { Items } from './features/items';
import { NewsGuides } from './features/news-guides';
import { StructuredData, getBreadcrumbSchema } from '@/components/StructuredData';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Force dynamic rendering to avoid database queries during build
export const dynamic = 'force-dynamic';

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
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-card">
          <Image
            src="https://cdn.metaforge.app/backgrounds/banner-arc-2.webp"
            alt="Arc Raiders"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-background/40" />
          <div className="relative h-full flex flex-col justify-center px-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              3RB
            </h1>
            <p className="mt-2 text-muted-foreground max-w-lg">
              Your complete companion for 3RB. Database, guides, maps, and tools all in one place.
            </p>
          </div>
        </div>

        {/* Get the Overlay App */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">احصل على تطبيق التراكب</h2>
          <a
            href="https://www.overwolf.com/app/metaforge"
            target="_blank"
            rel="noopener noreferrer"
            className="block relative h-48 rounded-xl overflow-hidden group"
          >
            <Image
              src="https://cdn.metaforge.app/custom/overlay-cta.webp"
              alt="MetaForge Overlay"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </a>
        </section>

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
              href="/guides"
              className="text-sm hover:underline transition-colors"
            >
              عرض جميع الأدلة ←
            </Link>
          </div>
          <NewsGuides />
        </section>

        {/* Featured YouTube Videos */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">فيديوهات مميزة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['9YpJ6qB6Bxw', 'dQw4w9WgXcQ', 'jNQXAC9IVRw', 'M7lc1UVf-VE'].map((videoId, idx) => (
              <div
                key={idx}
                className="aspect-video rounded-lg overflow-hidden bg-card border border-border"
              >
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={`Featured Video ${idx + 1}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
