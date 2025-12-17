import { ExploreCard } from './ExploreCard';
import { ExploreCategory } from '../types';

const categories: ExploreCategory[] = [
  {
    id: 'guides',
    title: 'GUIDES',
    href: '/guides',
    imageUrl: '/images/categories/guides.webp',
    description: 'Complete walkthroughs and strategies'
  },
  {
    id: 'items',
    title: 'ITEMS',
    href: '/items',
    imageUrl: '/images/categories/items.webp',
    description: 'Browse all items and equipment'
  },
  {
    id: 'arcs',
    title: 'ARCS',
    href: '/arcs',
    imageUrl: '/images/categories/arcs.webp',
    description: 'Discover all Arc types and abilities'
  },
  {
    id: 'quests',
    title: 'QUESTS',
    href: '/quests',
    imageUrl: '/images/categories/quests.webp',
    description: 'Mission objectives and rewards'
  },
  {
    id: 'traders',
    title: 'TRADERS',
    href: '/traders',
    imageUrl: '/images/categories/traders.webp',
    description: 'Find and trade with NPCs'
  },
  {
    id: 'skill-tree',
    title: 'SKILL TREE',
    href: '/skill-tree',
    imageUrl: '/images/categories/skill-tree.webp',
    description: 'Plan your character progression'
  },
  {
    id: 'loadouts',
    title: 'LOADOUTS',
    href: '/loadouts',
    imageUrl: '/images/categories/loadouts.webp',
    description: 'Optimal equipment setups'
  },
  {
    id: 'loot-value',
    title: 'LOOT VALUE',
    href: '/loot-value',
    imageUrl: '/images/categories/loot-value.webp',
    description: 'Item values and economics'
  },
  {
    id: 'needed-items',
    title: 'NEEDED ITEMS',
    href: '/needed-items',
    imageUrl: '/images/categories/needed-items.webp',
    description: 'Track essential items for quests'
  }
];

export function ExploreGrid() {
  const firstRow = categories.slice(0, 5);
  const secondRow = categories.slice(5, 9);

  return (
    <div className="space-y-2 md:space-y-3">
      {/* First Row - 5 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
        {firstRow.map((category) => (
          <ExploreCard key={category.id} category={category} />
        ))}
      </div>

      {/* Second Row - 4 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {secondRow.map((category) => (
          <ExploreCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
