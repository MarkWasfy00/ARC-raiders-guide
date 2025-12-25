'use server';

import { prisma } from '@/lib/prisma';

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  rarity: string | null;
}

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

export async function getBlueprints(): Promise<Blueprint[]> {
  try {
    const items = await prisma.item.findMany({
      where: {
        item_type: 'BLUEPRINT',
      },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        rarity: true,
      },
      orderBy: [
        { rarity: 'desc' },
        { name: 'asc' },
      ],
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      icon: getImageUrl(item.icon),
      rarity: item.rarity,
    }));
  } catch (error) {
    console.error('Error fetching blueprints:', error);
    return [];
  }
}
