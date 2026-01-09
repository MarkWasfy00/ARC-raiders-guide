// Core loadout data structure (stored in JSON field)
export interface LoadoutData {
  shield: string | null; // Item ID
  augment: string | null; // Bag/augment item ID
  backpack: (string | null)[]; // Array of item IDs
  quickUse: (string | null)[]; // Array of item IDs
  safePocket: (string | null)[]; // Array of item IDs
  weaponprimary: string | null; // Item ID
  weaponsecondary: string | null; // Item ID
  primaryAttachments: (string | null)[]; // 4 attachment slots
  secondaryAttachments: (string | null)[]; // 4 attachment slots
}

// Full loadout model (matches Prisma schema)
export interface Loadout {
  id: string;
  uuid: string | null;
  name: string;
  description: string | null;
  tags: string[];
  is_public: boolean;
  userId: string | null;
  profileData: ProfileData | null;
  loadoutData: LoadoutData;
  created_at: Date;
  updated_at: Date;
  user?: {
    id: string;
    username: string | null;
    embark_id: string | null;
  };
}

// Profile data for imported loadouts
export interface ProfileData {
  id: string;
  username: string;
  full_name: string;
}

// Bag capacity configuration
export interface LoadoutSlotConfig {
  backpackSlots: number;
  quickUseSlots: number;
  safePocketSlots: number;
}

// Item data with loadout-specific fields
export interface ItemWithSlots {
  id: string;
  name: string;
  icon: string | null;
  rarity: string | null;
  item_type: string | null;
  loadout_slots: string[];
  stat_block: any;
  description?: string | null;
  value: number;
}

// Slot type enumeration
export type LoadoutSlotType =
  | 'shield'
  | 'augment'
  | 'backpack'
  | 'quickUse'
  | 'safePocket'
  | 'weaponprimary'
  | 'weaponsecondary'
  | 'primaryAttachments'
  | 'secondaryAttachments';

// Slot selection state for dialogs
export interface SlotSelection {
  slotType: LoadoutSlotType;
  slotIndex?: number; // For array slots (backpack, quickUse, safePocket, attachments)
}

// Create loadout input data
export interface CreateLoadoutInput {
  name: string;
  description?: string;
  tags: string[];
  is_public: boolean;
  loadoutData: LoadoutData;
}

// Update loadout input data
export interface UpdateLoadoutInput {
  name?: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
  loadoutData?: LoadoutData;
}

// Loadout filters for querying
export interface LoadoutFilters {
  userId?: string;
  isPublic?: boolean;
  tags?: string[];
  search?: string;
}

// Server action response types
export interface LoadoutActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
