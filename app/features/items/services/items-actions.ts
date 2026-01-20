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

    const itemsPerType = 2;

    // OPTIMIZED: Single query instead of 23 separate queries
    // Fetch all items from all featured types in one query
    const allItems = await prisma.item.findMany({
      where: {
        item_type: { in: featuredTypes },
      },
      orderBy: [
        { item_type: 'asc' },
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

    // Post-process: select top N items per type
    const itemsByType = new Map<ItemType, typeof allItems>();

    for (const item of allItems) {
      if (!item.item_type) continue;
      const typeItems = itemsByType.get(item.item_type) || [];
      if (typeItems.length < itemsPerType) {
        typeItems.push(item);
        itemsByType.set(item.item_type, typeItems);
      }
    }

    // Flatten the map to array
    const selectedItems = Array.from(itemsByType.values()).flat();

    // Map database items to ItemData interface
    const items: ItemData[] = selectedItems.map((item) => {
      const statBlock = item.stat_block as Record<string, unknown> | null;

      return {
        id: item.id,
        name: item.name,
        imageUrl: getImageUrl(item.icon),
        classification: item.rarity || 'Common',
        description: item.description,
        stackSize: (statBlock?.stack_size as number) || (statBlock?.stackSize as number) || 1,
        size: (statBlock?.size as number) || 1,
        category: item.item_type || 'Misc',
        weight: (statBlock?.weight as number) || 0,
        recycleValue: item.value || 0,
      };
    });

    // If we don't have enough items, fetch more from any available type
    if (items.length < limit) {
      const existingIds = items.map(i => i.id);

      const additionalItems = await prisma.item.findMany({
        where: {
          id: { notIn: existingIds },
        },
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
        const statBlock = item.stat_block as Record<string, unknown> | null;

        return {
          id: item.id,
          name: item.name,
          imageUrl: getImageUrl(item.icon),
          classification: item.rarity || 'Common',
          description: item.description,
          stackSize: (statBlock?.stack_size as number) || (statBlock?.stackSize as number) || 1,
          size: (statBlock?.size as number) || 1,
          category: item.item_type || 'Misc',
          weight: (statBlock?.weight as number) || 0,
          recycleValue: item.value || 0,
        };
      });

      items.push(...mappedAdditional);
    }

    // Shuffle the items for variety and trim to exact limit
    const shuffled = items
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    return shuffled;
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return [];
  }
}
