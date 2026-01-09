import { ExploreCard } from './ExploreCard';
import { ExploreCategory } from '../types';

const categories: ExploreCategory[] = [
  {
    id: 'guides',
    title: 'الأدلة',
    href: '/guides',
    imageUrl: '/images/categories/guides.webp',
    description: 'شروحات كاملة واستراتيجيات'
  },
  {
    id: 'items',
    title: 'العناصر',
    href: '/items',
    imageUrl: '/images/categories/items.webp',
    description: 'تصفح جميع العناصر والمعدات'
  },
  {
    id: 'arcs',
    title: 'الآركات',
    href: '/arcs',
    imageUrl: '/images/categories/arcs.webp',
    description: 'اكتشف جميع أنواع الآرك وقدراتها'
  },
  {
    id: 'quests',
    title: 'المهام',
    href: '/quests',
    imageUrl: '/images/categories/quests.webp',
    description: 'أهداف المهام والمكافآت'
  },
  {
    id: 'traders',
    title: 'التجار',
    href: '/traders',
    imageUrl: '/images/categories/traders.webp',
    description: 'ابحث وتاجر مع التجار'
  },
  {
    id: 'skill-tree',
    title: 'شجرة المهارات',
    href: '/skill-tree',
    imageUrl: '/images/categories/skill-tree.webp',
    description: 'خطط لتطور شخصيتك'
  },
  {
    id: 'loadouts',
    title: 'التشكيلات',
    href: '/loadouts',
    imageUrl: '/images/categories/loadouts.webp',
    description: 'تجهيزات مثالية للمعدات'
  },
  {
    id: 'loot-value',
    title: 'قيمة الغنيمة',
    href: '/loot-value',
    imageUrl: '/images/categories/loot-value.webp',
    description: 'قيم العناصر والاقتصاد'
  },
  {
    id: 'needed-items',
    title: 'العناصر المطلوبة',
    href: '/needed-items',
    imageUrl: '/images/categories/needed-items.webp',
    description: 'تتبع العناصر الأساسية للمهام'
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
