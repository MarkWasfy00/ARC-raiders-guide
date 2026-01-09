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
} from '../types';

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
        error: 'يجب تسجيل الدخول لإنشاء حمولة', // Must be logged in to create loadout
      };
    }

    // Validate input
    if (!data.name || data.name.trim() === '') {
      return {
        success: false,
        error: 'اسم الحمولة مطلوب', // Loadout name is required
      };
    }

    // Create loadout
    const loadout = await prisma.loadout.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        tags: data.tags,
        is_public: data.is_public,
        userId: session.user.id,
        loadoutData: data.loadoutData as any,
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
      error: 'فشل في إنشاء الحمولة', // Failed to create loadout
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
        error: 'يجب تسجيل الدخول لتحديث الحمولة', // Must be logged in to update loadout
      };
    }

    // Check ownership
    const existing = await prisma.loadout.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return {
        success: false,
        error: 'الحمولة غير موجودة', // Loadout not found
      };
    }

    if (existing.userId !== session.user.id) {
      return {
        success: false,
        error: 'غير مصرح لك بتحديث هذه الحمولة', // Not authorized to update this loadout
      };
    }

    // Prepare update data
    const updateData: any = {};

    if (data.name !== undefined) {
      if (!data.name || data.name.trim() === '') {
        return {
          success: false,
          error: 'اسم الحمولة مطلوب', // Loadout name is required
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
      updateData.loadoutData = data.loadoutData as any;
    }

    // Update loadout
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
      error: 'فشل في تحديث الحمولة', // Failed to update loadout
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
        error: 'يجب تسجيل الدخول لحذف الحمولة', // Must be logged in to delete loadout
      };
    }

    // Check ownership
    const existing = await prisma.loadout.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return {
        success: false,
        error: 'الحمولة غير موجودة', // Loadout not found
      };
    }

    if (existing.userId !== session.user.id) {
      return {
        success: false,
        error: 'غير مصرح لك بحذف هذه الحمولة', // Not authorized to delete this loadout
      };
    }

    // Delete loadout
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
      error: 'فشل في حذف الحمولة', // Failed to delete loadout
    };
  }
}

/**
 * Calculate total weight and price for a loadout
 */
async function calculateLoadoutTotals(loadoutData: any): Promise<{ weight: number; price: number }> {
  try {
    // Extract all item IDs from loadout
    const itemIds = new Set<string>();

    if (loadoutData.shield) itemIds.add(loadoutData.shield);
    if (loadoutData.augment) itemIds.add(loadoutData.augment);
    if (loadoutData.weaponprimary) itemIds.add(loadoutData.weaponprimary);
    if (loadoutData.weaponsecondary) itemIds.add(loadoutData.weaponsecondary);

    // Add items from arrays
    [
      ...(loadoutData.backpack || []),
      ...(loadoutData.quickUse || []),
      ...(loadoutData.safePocket || []),
      ...(loadoutData.primaryAttachments || []),
      ...(loadoutData.secondaryAttachments || []),
    ].forEach((id) => {
      if (id && typeof id === 'string') itemIds.add(id);
    });

    if (itemIds.size === 0) {
      return { weight: 0, price: 0 };
    }

    // Fetch all items in one query
    const items = await prisma.item.findMany({
      where: {
        id: {
          in: Array.from(itemIds),
        },
      },
      select: {
        id: true,
        value: true,
        stat_block: true,
      },
    });

    // Calculate totals
    let totalWeight = 0;
    let totalPrice = 0;

    items.forEach((item) => {
      const weight = (item.stat_block as any)?.weight || 0;
      totalWeight += typeof weight === 'number' ? weight : 0;
      totalPrice += item.value || 0;
    });

    return {
      weight: totalWeight,
      price: totalPrice,
    };
  } catch (error) {
    console.error('Error calculating loadout totals:', error);
    return { weight: 0, price: 0 };
  }
}

/**
 * Get loadouts with filters and pagination
 * Public loadouts are visible to all, private only to owner
 */
export async function getLoadouts(
  filters?: LoadoutFilters & { page?: number; pageSize?: number }
): Promise<LoadoutActionResponse<{ loadouts: any[]; total: number; hasMore: boolean }>> {
  try {
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 12;
    const skip = (page - 1) * pageSize;

    const where: any = {};

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

    // Calculate totals for each loadout
    const loadoutsWithTotals = await Promise.all(
      loadouts.map(async (loadout) => {
        const totals = await calculateLoadoutTotals(loadout.loadoutData);
        return {
          ...loadout,
          totalWeight: totals.weight,
          totalPrice: totals.price,
        };
      })
    );

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
      error: 'فشل في جلب الحمولات', // Failed to fetch loadouts
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
        error: 'الحمولة غير موجودة', // Loadout not found
      };
    }

    // Check visibility
    if (!loadout.is_public && loadout.userId !== session?.user?.id) {
      return {
        success: false,
        error: 'غير مصرح لك بعرض هذه الحمولة', // Not authorized to view this loadout
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
      error: 'فشل في جلب الحمولة', // Failed to fetch loadout
    };
  }
}

/**
 * Get a single item by ID
 * Used for fetching item details when displaying loadout slots
 */
export async function getItem(
  id: string
): Promise<LoadoutActionResponse<any>> {
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
        error: 'العنصر غير موجود', // Item not found
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
      error: 'فشل في جلب العنصر', // Failed to fetch item
    };
  }
}
