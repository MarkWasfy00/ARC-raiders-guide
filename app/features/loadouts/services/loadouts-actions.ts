'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type {
  CreateLoadoutInput,
  UpdateLoadoutInput,
  LoadoutFilters,
  LoadoutActionResponse,
  Loadout,
  ItemWithSlots,
} from '../types';

interface LoadoutData {
  shield?: string;
  augment?: string;
  weaponprimary?: string;
  weaponsecondary?: string;
  backpack?: string[];
  quickUse?: string[];
  safePocket?: string[];
  primaryAttachments?: string[];
  secondaryAttachments?: string[];
}

interface ItemData {
  id: string;
  value: number | null;
  stat_block: Record<string, unknown> | null;
}

/**
 * Create a new loadout
 * Requires authentication
 */
export async function createLoadout(
  data: CreateLoadoutInput
): Promise<LoadoutActionResponse<Loadout>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'يجب تسجيل الدخول لإنشاء حمولة',
      };
    }

    if (!data.name || data.name.trim() === '') {
      return {
        success: false,
        error: 'اسم الحمولة مطلوب',
      };
    }

    const loadout = await prisma.loadout.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        tags: data.tags,
        is_public: data.is_public,
        userId: session.user.id,
        loadoutData: data.loadoutData as object,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            embark_id: true,
          },
        },
      },
    });

    revalidatePath('/loadouts');
    revalidatePath(`/loadouts/${loadout.id}`);

    return {
      success: true,
      data: loadout as unknown as Loadout,
    };
  } catch (error) {
    console.error('Error creating loadout:', error);
    return {
      success: false,
      error: 'فشل في إنشاء الحمولة',
    };
  }
}

/**
 * Update an existing loadout
 * Requires authentication and ownership
 */
export async function updateLoadout(
  id: string,
  data: UpdateLoadoutInput
): Promise<LoadoutActionResponse<Loadout>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'يجب تسجيل الدخول لتحديث الحمولة',
      };
    }

    const existing = await prisma.loadout.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return {
        success: false,
        error: 'الحمولة غير موجودة',
      };
    }

    if (existing.userId !== session.user.id) {
      return {
        success: false,
        error: 'غير مصرح لك بتحديث هذه الحمولة',
      };
    }

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      if (!data.name || data.name.trim() === '') {
        return {
          success: false,
          error: 'اسم الحمولة مطلوب',
        };
      }
      updateData.name = data.name.trim();
    }

    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }

    if (data.tags !== undefined) {
      updateData.tags = data.tags;
    }

    if (data.is_public !== undefined) {
      updateData.is_public = data.is_public;
    }

    if (data.loadoutData !== undefined) {
      updateData.loadoutData = data.loadoutData as unknown as Record<string, unknown>;
    }

    const loadout = await prisma.loadout.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            embark_id: true,
          },
        },
      },
    });

    revalidatePath('/loadouts');
    revalidatePath(`/loadouts/${id}`);
    revalidatePath(`/loadouts/${id}/edit`);

    return {
      success: true,
      data: loadout as unknown as Loadout,
    };
  } catch (error) {
    console.error('Error updating loadout:', error);
    return {
      success: false,
      error: 'فشل في تحديث الحمولة',
    };
  }
}

/**
 * Delete a loadout
 * Requires authentication and ownership
 */
export async function deleteLoadout(
  id: string
): Promise<LoadoutActionResponse<void>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'يجب تسجيل الدخول لحذف الحمولة',
      };
    }

    const existing = await prisma.loadout.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return {
        success: false,
        error: 'الحمولة غير موجودة',
      };
    }

    if (existing.userId !== session.user.id) {
      return {
        success: false,
        error: 'غير مصرح لك بحذف هذه الحمولة',
      };
    }

    await prisma.loadout.delete({
      where: { id },
    });

    revalidatePath('/loadouts');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting loadout:', error);
    return {
      success: false,
      error: 'فشل في حذف الحمولة',
    };
  }
}

/**
 * Extract all item IDs from loadout data
 */
function extractItemIds(loadoutData: LoadoutData): Set<string> {
  const itemIds = new Set<string>();

  if (loadoutData.shield) itemIds.add(loadoutData.shield);
  if (loadoutData.augment) itemIds.add(loadoutData.augment);
  if (loadoutData.weaponprimary) itemIds.add(loadoutData.weaponprimary);
  if (loadoutData.weaponsecondary) itemIds.add(loadoutData.weaponsecondary);

  [
    ...(loadoutData.backpack || []),
    ...(loadoutData.quickUse || []),
    ...(loadoutData.safePocket || []),
    ...(loadoutData.primaryAttachments || []),
    ...(loadoutData.secondaryAttachments || []),
  ].forEach((id) => {
    if (id && typeof id === 'string') itemIds.add(id);
  });

  return itemIds;
}

/**
 * Calculate totals from an items map (no database query)
 */
function calculateTotalsFromMap(
  loadoutData: LoadoutData,
  itemsMap: Map<string, ItemData>
): { weight: number; price: number } {
  const itemIds = extractItemIds(loadoutData);

  let totalWeight = 0;
  let totalPrice = 0;

  itemIds.forEach((id) => {
    const item = itemsMap.get(id);
    if (item) {
      const weight = (item.stat_block as Record<string, unknown>)?.weight;
      totalWeight += typeof weight === 'number' ? weight : 0;
      totalPrice += item.value || 0;
    }
  });

  return { weight: totalWeight, price: totalPrice };
}

/**
 * Calculate total weight and price for a single loadout (used for single loadout fetch)
 */
async function calculateLoadoutTotals(loadoutData: LoadoutData): Promise<{ weight: number; price: number }> {
  try {
    const itemIds = extractItemIds(loadoutData);

    if (itemIds.size === 0) {
      return { weight: 0, price: 0 };
    }

    const items = await prisma.item.findMany({
      where: {
        id: { in: Array.from(itemIds) },
      },
      select: {
        id: true,
        value: true,
        stat_block: true,
      },
    });

    let totalWeight = 0;
    let totalPrice = 0;

    items.forEach((item) => {
      const weight = (item.stat_block as Record<string, unknown>)?.weight;
      totalWeight += typeof weight === 'number' ? weight : 0;
      totalPrice += item.value || 0;
    });

    return { weight: totalWeight, price: totalPrice };
  } catch (error) {
    console.error('Error calculating loadout totals:', error);
    return { weight: 0, price: 0 };
  }
}

/**
 * Get loadouts with filters and pagination
 * Public loadouts are visible to all, private only to owner
 * OPTIMIZED: Uses batch item fetching instead of N+1 queries
 */
export async function getLoadouts(
  filters?: LoadoutFilters & { page?: number; pageSize?: number }
): Promise<LoadoutActionResponse<{ loadouts: unknown[]; total: number; hasMore: boolean }>> {
  try {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 12;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.isPublic !== undefined) {
      where.is_public = filters.isPublic;
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.loadout.count({ where });

    // Get paginated loadouts
    const loadouts = await prisma.loadout.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            embark_id: true,
          },
        },
      },
      skip,
      take: pageSize,
    });

    // OPTIMIZED: Extract ALL item IDs from ALL loadouts
    const allItemIds = new Set<string>();
    loadouts.forEach((loadout) => {
      const ids = extractItemIds(loadout.loadoutData as LoadoutData);
      ids.forEach((id) => allItemIds.add(id));
    });

    // OPTIMIZED: Single query to fetch ALL items
    const itemsMap = new Map<string, ItemData>();
    if (allItemIds.size > 0) {
      const items = await prisma.item.findMany({
        where: {
          id: { in: Array.from(allItemIds) },
        },
        select: {
          id: true,
          value: true,
          stat_block: true,
        },
      });

      items.forEach((item) => {
        itemsMap.set(item.id, item as ItemData);
      });
    }

    // Calculate totals using the map (no additional queries)
    const loadoutsWithTotals = loadouts.map((loadout) => {
      const totals = calculateTotalsFromMap(loadout.loadoutData as LoadoutData, itemsMap);
      return {
        ...loadout,
        totalWeight: totals.weight,
        totalPrice: totals.price,
      };
    });

    return {
      success: true,
      data: {
        loadouts: loadoutsWithTotals,
        total,
        hasMore: skip + loadouts.length < total,
      },
    };
  } catch (error) {
    console.error('Error fetching loadouts:', error);
    return {
      success: false,
      error: 'فشل في جلب الحمولات',
    };
  }
}

/**
 * Get a single loadout by ID
 * Public loadouts visible to all, private only to owner
 */
export async function getLoadout(
  id: string
): Promise<LoadoutActionResponse<Loadout>> {
  try {
    const session = await auth();

    const loadout = await prisma.loadout.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            embark_id: true,
          },
        },
      },
    });

    if (!loadout) {
      return {
        success: false,
        error: 'الحمولة غير موجودة',
      };
    }

    // Check visibility
    if (!loadout.is_public && loadout.userId !== session?.user?.id) {
      return {
        success: false,
        error: 'غير مصرح لك بعرض هذه الحمولة',
      };
    }

    return {
      success: true,
      data: loadout as unknown as Loadout,
    };
  } catch (error) {
    console.error('Error fetching loadout:', error);
    return {
      success: false,
      error: 'فشل في جلب الحمولة',
    };
  }
}

/**
 * Get a single item by ID
 * Used for fetching item details when displaying loadout slots
 */
export async function getItem(
  id: string
): Promise<LoadoutActionResponse<ItemWithSlots>> {
  try {
    const item = await prisma.item.findUnique({
      where: { id },
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
    });

    if (!item) {
      return {
        success: false,
        error: 'العنصر غير موجود',
      };
    }

    // Convert icon to full URL
    const iconUrl = item.icon
      ? item.icon.startsWith('http')
        ? item.icon
        : `https://cdn.metaforge.app/arc-raiders/icons/${
            item.icon.endsWith('.webp') ? item.icon : `${item.icon}.webp`
          }`
      : null;

    return {
      success: true,
      data: {
        ...item,
        icon: iconUrl,
      },
    };
  } catch (error) {
    console.error('Error fetching item:', error);
    return {
      success: false,
      error: 'فشل في جلب العنصر',
    };
  }
}
