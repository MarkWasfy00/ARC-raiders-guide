import { ItemsGrid } from './ItemsGrid';
import { getFeaturedItems } from '../services/items-actions';

export async function Items() {
  const items = await getFeaturedItems(36);
  const randomizedItems = items.slice().sort(() => Math.random() - 0.5);

  return <ItemsGrid items={randomizedItems} />;
}
