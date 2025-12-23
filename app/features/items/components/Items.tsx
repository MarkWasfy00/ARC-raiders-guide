import { ItemsGrid } from './ItemsGrid';
import { getFeaturedItems } from '../services/items-actions';

export async function Items() {
  const items = await getFeaturedItems(20);

  return <ItemsGrid items={items} />;
}
