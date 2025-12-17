import { NewsGuidesGrid } from './NewsGuidesGrid';

export function NewsGuides() {
  return (
    <section className="w-full py-8 md:py-12" aria-labelledby="news-guides-heading">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Title */}
        <h2
          id="news-guides-heading"
          className="text-2xl md:text-3xl font-bold mb-6 md:mb-8"
        >
          ARC Raiders News & Guides
        </h2>

        {/* News & Guides Grid */}
        <NewsGuidesGrid />
      </div>
    </section>
  );
}
