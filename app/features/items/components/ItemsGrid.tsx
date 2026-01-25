import { ItemsCarousel } from './ItemsCarousel';
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

  return <ItemsCarousel items={items} />;
}
