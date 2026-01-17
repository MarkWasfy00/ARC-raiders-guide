import Link from 'next/link';
import { ExploreRaiders } from './features/explore-raiders';
import { Maps } from './features/maps';
import { Items } from './features/items';
import { RecentBlogs } from './features/blog';
import { StructuredData, getBreadcrumbSchema } from '@/components/StructuredData';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Force dynamic rendering to avoid database queries during build
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen">
      <StructuredData
        data={getBreadcrumbSchema(baseUrl, [{ name: 'OU,OñOÝUSO3USOc', url: '/' }])}
      />
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero + Categories */}
        <section>
          <ExploreRaiders />
        </section>

        {/* World Explorer */}
        <section>
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">OrOñOOÝOú O›OñUŸ OñOUSO_OñOý</h2>
          </div>
          <Maps />
        </section>

        {/* ARC Raiders Items */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">O1U+OOæOñ O›OñUŸ OñOUSO_OñOý</h2>
            <Link
              href="/items"
              className="text-sm hover:underline transition-colors"
            >
              O1OñO OªU.USO1 OU,O1U+OOæOñ ƒ+?
            </Link>
          </div>
          <Items />
        </section>

        {/* News & Guides */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">OU,OœOrO"OOñ U^OU,OœO_U,Oc</h2>
            <Link
              href="/blogs"
              className="text-sm hover:underline transition-colors"
            >
              O1OñO OªU.USO1 OU,U.U,OU,OO¦ ƒ+?
            </Link>
          </div>
          <RecentBlogs limit={8} />
        </section>
      </div>
    </main>
  );
}
