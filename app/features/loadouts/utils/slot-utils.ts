import { ItemWithSlots, LoadoutSlotConfig, LoadoutData } from '../types';

/**
 * Extract bag capacity from bag item's stat_block
 * Returns default capacity if stat_block is missing or invalid
 */
export function getBagCapacity(bagItem: ItemWithSlots | null): LoadoutSlotConfig {
  const defaultConfig: LoadoutSlotConfig = {
    backpackSlots: 14,
    quickUseSlots: 4,
    safePocketSlots: 0,
  };

  if (!bagItem || !bagItem.stat_block) {
    return defaultConfig;
  }

  const statBlock = bagItem.stat_block as any;

  return {
    backpackSlots: statBlock.backpackSlots ?? defaultConfig.backpackSlots,
    quickUseSlots: statBlock.quickUseSlots ?? defaultConfig.quickUseSlots,
    safePocketSlots: statBlock.safePocketSlots ?? defaultConfig.safePocketSlots,
  };
}

/**
 * Initialize empty slot arrays based on bag capacity
 */
export function initializeSlots(capacity: LoadoutSlotConfig) {
  return {
    backpack: Array(capacity.backpackSlots).fill(null),
    quickUse: Array(capacity.quickUseSlots).fill(null),
    safePocket: Array(capacity.safePocketSlots).fill(null),
  };
}

/**
 * Resize slot array when bag changes
 * Expands by adding nulls, shrinks by keeping first N items
 */
export function resizeSlots(
  currentSlots: (string | null)[],
  newCapacity: number
): (string | null)[] {
  if (currentSlots.length === newCapacity) {
    return currentSlots;
  }

  if (currentSlots.length < newCapacity) {
    // Expand: add nulls to the end
    const additionalSlots = newCapacity - currentSlots.length;
    return [...currentSlots, ...Array(additionalSlots).fill(null)];
  } else {
    // Shrink: keep only first N items
    return currentSlots.slice(0, newCapacity);
  }
}

/**
 * Convert icon path to full CDN URL
 * Handles null, empty strings, and already-complete URLs
 */
export function getItemIconUrl(icon: string | null): string {
  // If no icon, return placeholder
  if (!icon || icon.trim() === '') {
    return '/images/items/placeholder.jpg';
  }

  // If already a full URL, return as-is
  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return icon;
  }

  // Construct full CDN URL
  const iconId = icon.endsWith('.webp') ? icon : `${icon}.webp`;
  return `https://cdn.metaforge.app/arc-raiders/icons/${iconId}`;
}

/**
 * Validate loadout data before saving
 * Returns error message if invalid, null if valid
 */
export function validateLoadoutData(data: {
  name: string;
  description?: string;
}): string | null {
  if (!data.name || data.name.trim() === '') {
    return 'اسم الحمولة مطلوب'; // Name is required
  }

  if (data.name.length > 100) {
    return 'الاسم طويل جداً (100 حرف كحد أقصى)'; // Name too long (100 chars max)
  }

  if (data.description && data.description.length > 1000) {
    return 'الوصف طويل جداً (1000 حرف كحد أقصى)'; // Description too long (1000 chars max)
  }

  return null;
}

/**
 * Create empty loadout data with default slots
 */
export function createEmptyLoadoutData(): LoadoutData {
  return {
    shield: null,
    augment: null,
    backpack: Array(14).fill(null), // Default bag size
    quickUse: Array(4).fill(null),
    safePocket: [],
    weaponprimary: null,
    weaponsecondary: null,
    primaryAttachments: Array(4).fill(null),
    secondaryAttachments: Array(4).fill(null),
  };
}

/**
 * Get rarity color class for UI
 */
export function getRarityColor(rarity: string | null): string {
  switch (rarity?.toUpperCase()) {
    case 'LEGENDARY':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20';
    case 'EPIC':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20';
    case 'RARE':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20';
    case 'UNCOMMON':
      return 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 dark:text-gray-500 border-gray-500/20';
  }
}

/**
 * Format slot name for display (Arabic)
 */
export function getSlotDisplayName(slotType: string): string {
  const slotNames: Record<string, string> = {
    shield: 'الدرع',
    augment: 'الحقيبة',
    backpack: 'الحقيبة',
    quickUse: 'الاستخدام السريع',
    safePocket: 'الجيب الآمن',
    weaponprimary: 'السلاح الأساسي',
    weaponsecondary: 'السلاح الثانوي',
    primaryAttachments: 'ملحقات السلاح الأساسي',
    secondaryAttachments: 'ملحقات السلاح الثانوي',
  };

  return slotNames[slotType] || slotType;
}
