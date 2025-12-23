'use server';

import { prisma } from '@/lib/prisma';
import { ItemData } from '../types';

/**
 * Converts an icon value to a valid image URL
 */
function getImageUrl(icon: string | null): string {
  // If no icon, return placeholder
  if (!icon || icon.trim() === '') {
    return '/images/items/placeholder.jpg';
  }

  // If already a full URL, return as-is
  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return icon;
  }

  // If it's just an ID or partial path, construct full CDN URL
  const iconId = icon.endsWith('.webp') ? icon : `${icon}.webp`;
  return `https://cdn.metaforge.app/arc-raiders/icons/${iconId}`;
}

export async function getFeaturedItems(limit: number = 20): Promise<ItemData[]> {
  try {
    const items = await prisma.item.findMany({
      take: limit,
      orderBy: [
        { rarity: 'desc' },
        { value: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        item_type: true,
        icon: true,
        rarity: true,
        value: true,
        stat_block: true,
      },
    });

    // Map database items to ItemData interface
    return items.map((item) => {
      const statBlock = item.stat_block as any;

      return {
        id: item.id,
        name: item.name,
        imageUrl: getImageUrl(item.icon),
        classification: item.rarity || 'Common',
        description: item.description,
        stackSize: statBlock?.stack_size || statBlock?.stackSize || 1,
        size: statBlock?.size || 1,
        category: item.item_type || 'Misc',
        weight: statBlock?.weight || 0,
        recycleValue: item.value || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return [];
  }
}
