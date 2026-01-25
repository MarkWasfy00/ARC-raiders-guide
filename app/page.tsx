import Link from 'next/link';
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
        data={getBreadcrumbSchema(baseUrl, [{ name: 'الرئيسية', url: '/' }])}
      />
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero + Categories */}
        <section>
          <ExploreRaiders />
        </section>

        {/* World Explorer */}
        <section>
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">خرائط آرك رايدرز</h2>
          </div>
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
