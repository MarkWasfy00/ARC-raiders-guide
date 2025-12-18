import Link from 'next/link';
import Image from 'next/image';
import { ExploreRaiders } from './features/explore-raiders';
import { Maps } from './features/maps';
import { Items } from './features/items';
import { NewsGuides } from './features/news-guides';

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="w-full px-[100px] py-8 space-y-12">
        {/* Hero Banner */}
        <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20">
          <Image
            src="https://cdn.metaforge.app/backgrounds/banner-arc-2.webp"
            alt="Arc Raiders"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
          <div className="relative h-full flex flex-col justify-center px-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              ARC Raiders
            </h1>
          </div>
        </div>

        {/* Get the Overlay App */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Get the Overlay App</h2>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Explore Arc Raiders</h2>
          <ExploreRaiders />
        </section>

        {/* ARC Raiders Maps */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">ARC Raiders Maps</h2>
          <Maps />
        </section>

        {/* ARC Raiders Items */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">ARC Raiders Items</h2>
            <Link
              href="/items"
              className="text-sm hover:underline transition-colors"
            >
              View all items →
            </Link>
          </div>
          <Items />
        </section>

        {/* News & Guides */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">News & Guides</h2>
            <Link
              href="/guides"
              className="text-sm hover:underline transition-colors"
            >
              View all guides →
            </Link>
          </div>
          <NewsGuides />
        </section>

        {/* Featured YouTube Videos */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Featured Videos</h2>
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
