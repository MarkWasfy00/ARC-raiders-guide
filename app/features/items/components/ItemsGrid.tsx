import { ItemCard } from './ItemCard';
import { ItemData } from '../types';

interface ItemsGridProps {
  items: ItemData[];
}

export function ItemsGrid({ items }: ItemsGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد عناصر متاحة حالياً
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
