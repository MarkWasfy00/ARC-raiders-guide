import { ItemsGrid } from './ItemsGrid';

export function Items() {
  return (
    <section className="w-full py-8 md:py-12 " aria-labelledby="items-heading">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Title */}
        <h2
          id="items-heading"
          className="text-2xl md:text-3xl font-bold mb-6 md:mb-8"
        >
          ARC Raiders Items
        </h2>

        {/* Items Grid */}
        <ItemsGrid />
      </div>
    </section>
  );
}
