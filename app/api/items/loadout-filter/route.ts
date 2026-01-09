import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/items/loadout-filter
 * Fetch items filtered by loadout slot type
 *
 * Query params:
 * - slotType: Required - The slot type to filter by (e.g., 'augment', 'shield', 'weaponprimary')
 * - search: Optional - Search term for filtering items by name
 */
/**
 * Map loadout slot types to item types
 */
function getItemTypeForSlot(slotType: string): string[] | null {
  const slotMapping: Record<string, string[]> = {
    shield: ['SHIELD'],
    augment: ['AUGMENT'],
    weaponprimary: ['WEAPON'],
    weaponsecondary: ['WEAPON'],
    primaryAttachments: ['MODIFICATION', 'MODS'],
    secondaryAttachments: ['MODIFICATION', 'MODS'],
    // Backpack, quickUse, and safePocket can contain most items
    backpack: [
      'AMMUNITION',
      'BASIC_MATERIAL',
      'ADVANCED_MATERIAL',
      'REFINED_MATERIAL',
      'TOPSIDE_MATERIAL',
      'CONSUMABLE',
      'MEDICAL',
      'THROWABLE',
      'GADGET',
      'QUICK_USE',
      'MISC',
      'MATERIAL',
      'NATURE',
      'RECYCLABLE',
      'REFINEMENT',
      'KEY',
      'QUEST_ITEM',
      'TRINKET',
      'BLUEPRINT',
      'COSMETIC',
    ],
    quickUse: ['QUICK_USE', 'MEDICAL', 'CONSUMABLE', 'THROWABLE'],
    safePocket: [
      'AMMUNITION',
      'BASIC_MATERIAL',
      'ADVANCED_MATERIAL',
      'REFINED_MATERIAL',
      'TOPSIDE_MATERIAL',
      'CONSUMABLE',
      'MEDICAL',
      'THROWABLE',
      'GADGET',
      'QUICK_USE',
      'MISC',
      'MATERIAL',
      'NATURE',
      'RECYCLABLE',
      'REFINEMENT',
      'KEY',
      'QUEST_ITEM',
      'TRINKET',
      'BLUEPRINT',
      'COSMETIC',
    ],
  };

  return slotMapping[slotType] || null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slotType = searchParams.get('slotType');
    const search = searchParams.get('search') || '';

    if (!slotType) {
      return NextResponse.json(
        { success: false, error: 'slotType parameter is required' },
        { status: 400 }
      );
    }

    // Get the item types for this slot
    const itemTypes = getItemTypeForSlot(slotType);

    if (!itemTypes) {
      return NextResponse.json(
        { success: false, error: `Unknown slot type: ${slotType}` },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      item_type: {
        in: itemTypes,
      },
    };

    // Add search filter if provided
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Fetch items
    const items = await prisma.item.findMany({
      where,
      select: {
        id: true,
        name: true,
        icon: true,
        rarity: true,
        item_type: true,
        loadout_slots: true,
        stat_block: true,
        description: true,
        value: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Convert icon paths to full URLs
    const itemsWithUrls = items.map((item) => ({
      ...item,
      icon: item.icon
        ? item.icon.startsWith('http')
          ? item.icon
          : `https://cdn.metaforge.app/arc-raiders/icons/${
              item.icon.endsWith('.webp') ? item.icon : `${item.icon}.webp`
            }`
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: itemsWithUrls,
    });
  } catch (error) {
    console.error('Error fetching items by slot type:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch items',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
