'use server';

import { prisma } from '@/lib/prisma';
import { ItemType } from '@/lib/generated/prisma/client';
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
    // Define item types to showcase (variety of categories)
    const featuredTypes: ItemType[] = [
      ItemType.WEAPON,
      ItemType.SHIELD,
      ItemType.MEDICAL,
      ItemType.CONSUMABLE,
      ItemType.GADGET,
      ItemType.MODIFICATION,
      ItemType.MATERIAL,
      ItemType.REFINED_MATERIAL,
      ItemType.BLUEPRINT,
      ItemType.COSMETIC,
      ItemType.THROWABLE,
      ItemType.TRINKET,
      ItemType.AUGMENT,
      ItemType.BASIC_MATERIAL,
      ItemType.KEY,
      ItemType.MISC,
      ItemType.MODS,
      ItemType.NATURE,
      ItemType.QUEST_ITEM,
      ItemType.QUICK_USE,
      ItemType.RECYCLABLE,
      ItemType.REFINEMENT,
      ItemType.TOPSIDE_MATERIAL
    ];

    // Calculate items per type (aim for 2 items per type initially)
    const itemsPerType = 2;
    const items: ItemData[] = [];

    // Fetch items from each type
    for (const type of featuredTypes) {
      const typeItems = await prisma.item.findMany({
        where: {
          item_type: type,
        },
        take: itemsPerType,
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
      const mappedItems = typeItems.map((item) => {
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

      items.push(...mappedItems);
    }

    // If we don't have enough items, fetch more from any available type
    if (items.length < limit) {
      const additionalItems = await prisma.item.findMany({
        take: limit - items.length,
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

      const mappedAdditional = additionalItems.map((item) => {
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

      items.push(...mappedAdditional);
    }

    // Remove duplicates based on ID
    const uniqueItems = Array.from(
      new Map(items.map(item => [item.id, item])).values()
    );

    // Shuffle the items for variety and trim to exact limit
    const shuffled = uniqueItems
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    return shuffled;
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return [];
  }
}
