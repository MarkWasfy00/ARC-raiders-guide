import { ExploreRaiders } from './features/explore-raiders';
import { Maps } from './features/maps';
import { Items } from './features/items';
import { NewsGuides } from './features/news-guides';

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <ExploreRaiders />
        <div className="h-[1px] w-1/2 mx-auto my-12" style={{ backgroundColor: 'var(--secondary)' }} />
        <Maps />
        <div className="h-[1px] w-1/2 mx-auto my-12" style={{ backgroundColor: 'var(--secondary)' }} />
        <Items />
        <div className="h-[1px] w-1/2 mx-auto my-12" style={{ backgroundColor: 'var(--secondary)' }} />
        <NewsGuides />
      </div>
    </main>
  );
}
