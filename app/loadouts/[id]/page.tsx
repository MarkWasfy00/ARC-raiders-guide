'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  ChevronDown,
  Eye,
  EyeOff,
  Flag,
  Pin,
  Search,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadoutTag =
  | 'PvP'
  | 'PvE'
  | 'Solo'
  | 'Duo'
  | 'Trio'
  | 'Close Range'
  | 'Mid Range'
  | 'Long Range';

type Tier = 'I' | 'II' | 'III' | 'IV';

type CatalogItemType = 'bag' | 'weapon' | 'shield' | 'item' | 'quick';

type CatalogItem = {
  id: string;
  name: string;
  image: string;
  type: CatalogItemType;
  category: string;
  tier: Tier;
  meta?: string;
  slots?: {
    backpack: number;
    quick: number;
    safe: number;
    compatibility: string;
  };
  shieldWeight?: 'Light' | 'Medium' | 'Heavy';
};

type LoadoutBuild = {
  bag: CatalogItem | null;
  primary: CatalogItem | null;
  secondary: CatalogItem | null;
  shield: CatalogItem | null;
  backpack: (CatalogItem | null)[];
  quickUse: (CatalogItem | null)[];
  safePocket: (CatalogItem | null)[];
};

type Loadout = {
  id: string;
  name: string;
  mode: string;
  author: string;
  date: string;
  description: string;
  tags: LoadoutTag[];
  isPublic: boolean;
  isMine: boolean;
  build: LoadoutBuild;
};

type Comment = {
  id: string;
  user: string;
  avatar: string;
  body: string;
  createdAt: string;
  reaction: 'like' | 'unlike' | null;
};

type SlotTarget =
  | { type: 'bag' }
  | { type: 'primary' }
  | { type: 'secondary' }
  | { type: 'shield' }
  | { type: 'primary-attachment'; index: number }
  | { type: 'secondary-attachment'; index: number }
  | { type: 'backpack'; index: number }
  | { type: 'quick'; index: number }
  | { type: 'safe'; index: number };

type NeededItem = {
  id: string;
  name: string;
  image: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  have: number;
  need: number;
  subcategories?: string[];
};

type NeededList = {
  id: string;
  name: string;
  type: 'default' | 'custom';
  items: NeededItem[];
  subcategoryOrder?: string[];
};

const STORAGE_KEY = 'arc-needed-items-state';
const LOADOUTS_STORAGE_KEY = 'arc-loadouts-state';

const TAGS: LoadoutTag[] = [
  'PvP',
  'PvE',
  'Solo',
  'Duo',
  'Trio',
  'Close Range',
  'Mid Range',
  'Long Range',
];

const CATEGORY_OPTIONS = [
  'All categories',
  'Advanced',
  'Ammunition',
  'Augment',
  'Backpack',
  'Consumable',
  'Equipment',
  'Weapon',
  'Shield',
  'Utility',
];

const TIER_OPTIONS = ['All tiers', 'I', 'II', 'III', 'IV'];

const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'bag-survivor-mk3',
    name: 'Looting Bag MK.3 Survivor',
    image: 'https://cdn.metaforge.app/arc-raiders/items/bag-survivor.webp',
    type: 'bag',
    category: 'Backpack',
    tier: 'III',
    slots: {
      backpack: 14,
      quick: 8,
      safe: 4,
      compatibility: 'Light & Medium shields',
    },
  },
  {
    id: 'bag-warden',
    name: 'Warden Long Haul Bag',
    image: 'https://cdn.metaforge.app/arc-raiders/items/bag-warden.webp',
    type: 'bag',
    category: 'Backpack',
    tier: 'IV',
    slots: {
      backpack: 18,
      quick: 7,
      safe: 5,
      compatibility: 'Light, Medium, and Heavy shields',
    },
  },
  {
    id: 'weapon-manticore',
    name: 'Manticore SMG',
    image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-1.webp',
    type: 'weapon',
    category: 'Weapon',
    tier: 'II',
    meta: 'SMG',
  },
  {
    id: 'weapon-longbow',
    name: 'Longbow DMR',
    image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-2.webp',
    type: 'weapon',
    category: 'Weapon',
    tier: 'III',
    meta: 'DMR',
  },
  {
    id: 'weapon-breaker',
    name: 'Breaker Shotgun',
    image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-3.webp',
    type: 'weapon',
    category: 'Weapon',
    tier: 'II',
    meta: 'Shotgun',
  },
  {
    id: 'weapon-harrier',
    name: 'Harrier AR',
    image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-5.webp',
    type: 'weapon',
    category: 'Weapon',
    tier: 'III',
    meta: 'Assault Rifle',
  },
  {
    id: 'shield-light',
    name: 'Lightweight Field Shield',
    image: 'https://cdn.metaforge.app/arc-raiders/items/shield-core.webp',
    type: 'shield',
    category: 'Shield',
    tier: 'II',
    shieldWeight: 'Light',
  },
  {
    id: 'shield-medium',
    name: 'Medium Vanguard Shield',
    image: 'https://cdn.metaforge.app/arc-raiders/items/shield-vanguard.webp',
    type: 'shield',
    category: 'Shield',
    tier: 'III',
    shieldWeight: 'Medium',
  },
  {
    id: 'shield-heavy',
    name: 'Heavy Bastion Shield',
    image: 'https://cdn.metaforge.app/arc-raiders/items/shield-heavy.webp',
    type: 'shield',
    category: 'Shield',
    tier: 'IV',
    shieldWeight: 'Heavy',
  },
  {
    id: 'item-arc-alloy',
    name: 'Arc Alloy',
    image: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp',
    type: 'item',
    category: 'Equipment',
    tier: 'III',
  },
  {
    id: 'item-energy-cell',
    name: 'Energy Cell',
    image: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp',
    type: 'item',
    category: 'Ammunition',
    tier: 'II',
  },
  {
    id: 'item-medkit',
    name: 'Medical Supplies',
    image: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp',
    type: 'item',
    category: 'Consumable',
    tier: 'II',
  },
  {
    id: 'item-plasma-core',
    name: 'Plasma Core',
    image: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp',
    type: 'item',
    category: 'Advanced',
    tier: 'IV',
  },
  {
    id: 'quick-bandage',
    name: 'Bandage',
    image: 'https://cdn.metaforge.app/arc-raiders/items/bandage.webp',
    type: 'quick',
    category: 'Consumable',
    tier: 'I',
  },
  {
    id: 'quick-adrenaline',
    name: 'Adrenaline Shot',
    image: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp',
    type: 'quick',
    category: 'Utility',
    tier: 'III',
  },
  {
    id: 'quick-stim',
    name: 'Stimulant Kit',
    image: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp',
    type: 'quick',
    category: 'Consumable',
    tier: 'II',
  },
  {
    id: 'item-armor-patch',
    name: 'Armor Patch',
    image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
    type: 'item',
    category: 'Equipment',
    tier: 'I',
  },
  {
    id: 'item-circuit-board',
    name: 'Circuit Board',
    image: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp',
    type: 'item',
    category: 'Advanced',
    tier: 'II',
  },
  {
    id: 'item-steel-plate',
    name: 'Steel Plate',
    image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
    type: 'item',
    category: 'Equipment',
    tier: 'I',
  },
  {
    id: 'item-nano-fiber',
    name: 'Nano Fiber',
    image: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp',
    type: 'item',
    category: 'Advanced',
    tier: 'III',
  },
  {
    id: 'item-power-coil',
    name: 'Power Coil',
    image: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp',
    type: 'item',
    category: 'Ammunition',
    tier: 'II',
  },
  {
    id: 'item-servo-motor',
    name: 'Servo Motor',
    image: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp',
    type: 'item',
    category: 'Advanced',
    tier: 'III',
  },
  {
    id: 'item-optic-lens',
    name: 'Optic Lens',
    image: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp',
    type: 'item',
    category: 'Equipment',
    tier: 'II',
  },
  {
    id: 'item-coolant-vial',
    name: 'Coolant Vial',
    image: 'https://cdn.metaforge.app/arc-raiders/items/bandage.webp',
    type: 'item',
    category: 'Consumable',
    tier: 'I',
  },
  {
    id: 'item-weapon-blueprint',
    name: 'Weapon Blueprint Cache',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/sentry.webp',
    type: 'item',
    category: 'Advanced',
    tier: 'IV',
  },
  {
    id: 'item-arc-conductor',
    name: 'Arc Conductor',
    image: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp',
    type: 'item',
    category: 'Equipment',
    tier: 'III',
  },
  {
    id: 'item-reactor-core',
    name: 'Reactor Core',
    image: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp',
    type: 'item',
    category: 'Advanced',
    tier: 'IV',
  },
  {
    id: 'item-fiber-spool',
    name: 'Fiber Spool',
    image: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp',
    type: 'item',
    category: 'Equipment',
    tier: 'II',
  },
  {
    id: 'item-thermal-paste',
    name: 'Thermal Paste',
    image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
    type: 'item',
    category: 'Advanced',
    tier: 'II',
  },
  {
    id: 'item-signal-chip',
    name: 'Signal Chip',
    image: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp',
    type: 'item',
    category: 'Advanced',
    tier: 'III',
  },
  {
    id: 'item-medical-gel',
    name: 'Medical Gel',
    image: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp',
    type: 'item',
    category: 'Consumable',
    tier: 'II',
  },
  {
    id: 'item-kinetic-pellets',
    name: 'Kinetic Pellets',
    image: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp',
    type: 'item',
    category: 'Ammunition',
    tier: 'I',
  },
  {
    id: 'item-precision-kit',
    name: 'Precision Kit',
    image: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp',
    type: 'item',
    category: 'Equipment',
    tier: 'III',
  },
  {
    id: 'item-carbon-sheet',
    name: 'Carbon Sheet',
    image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
    type: 'item',
    category: 'Equipment',
    tier: 'II',
  },
  {
    id: 'item-plasma-conduit',
    name: 'Plasma Conduit',
    image: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp',
    type: 'item',
    category: 'Advanced',
    tier: 'IV',
  },
  {
    id: 'quick-field-kit',
    name: 'Field Repair Kit',
    image: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp',
    type: 'quick',
    category: 'Utility',
    tier: 'II',
  },
  {
    id: 'quick-smoke',
    name: 'Smoke Canister',
    image: 'https://cdn.metaforge.app/arc-raiders/items/bandage.webp',
    type: 'quick',
    category: 'Utility',
    tier: 'I',
  },
  {
    id: 'quick-shock',
    name: 'Shock Dart',
    image: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp',
    type: 'quick',
    category: 'Utility',
    tier: 'II',
  },
  {
    id: 'quick-stimulant-plus',
    name: 'Stimulant+',
    image: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp',
    type: 'quick',
    category: 'Consumable',
    tier: 'III',
  },
  {
    id: 'item-hex-coil',
    name: 'Hex Coil',
    image: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp',
    type: 'item',
    category: 'Ammunition',
    tier: 'III',
  },
  {
    id: 'item-arc-conduit',
    name: 'Arc Conduit',
    image: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp',
    type: 'item',
    category: 'Advanced',
    tier: 'IV',
  },
  {
    id: 'item-regen-pack',
    name: 'Regen Pack',
    image: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp',
    type: 'item',
    category: 'Consumable',
    tier: 'II',
  },
  {
    id: 'item-reactor-shell',
    name: 'Reactor Shell',
    image: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp',
    type: 'item',
    category: 'Advanced',
    tier: 'III',
  },
  {
    id: 'item-titan-plate',
    name: 'Titan Plate',
    image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
    type: 'item',
    category: 'Equipment',
    tier: 'II',
  },
  {
    id: 'quick-flare',
    name: 'Signal Flare',
    image: 'https://cdn.metaforge.app/arc-raiders/items/bandage.webp',
    type: 'quick',
    category: 'Utility',
    tier: 'I',
  },
  {
    id: 'quick-emp',
    name: 'EMP Charge',
    image: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp',
    type: 'quick',
    category: 'Utility',
    tier: 'III',
  },
];

const LOADOUTS: Loadout[] = [
  {
    id: 'farm-solo',
    name: 'Farm Solo',
    mode: 'PvAll',
    author: 'EchoRunner',
    date: '2025-10-27',
    description: 'Quiet farming loop for early tech drops with a flexible mid-range kit.',
    tags: ['PvE', 'Solo', 'Mid Range'],
    isPublic: true,
    isMine: false,
    build: {
      bag: CATALOG_ITEMS.find((item) => item.id === 'bag-survivor-mk3') ?? null,
      primary: CATALOG_ITEMS.find((item) => item.id === 'weapon-manticore') as CatalogItem,
      secondary: CATALOG_ITEMS.find((item) => item.id === 'weapon-longbow') as CatalogItem,
      shield: CATALOG_ITEMS.find((item) => item.id === 'shield-medium') ?? null,
      backpack: [
        CATALOG_ITEMS.find((item) => item.id === 'item-arc-alloy') ?? null,
        CATALOG_ITEMS.find((item) => item.id === 'item-energy-cell') ?? null,
        CATALOG_ITEMS.find((item) => item.id === 'item-medkit') ?? null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      quickUse: [
        CATALOG_ITEMS.find((item) => item.id === 'quick-bandage') ?? null,
        CATALOG_ITEMS.find((item) => item.id === 'quick-adrenaline') ?? null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      safePocket: [
        CATALOG_ITEMS.find((item) => item.id === 'item-plasma-core') ?? null,
        null,
        null,
        null,
      ],
    },
  },
  {
    id: 'my-bunker',
    name: 'My Bunker Run',
    mode: 'PvAll',
    author: 'You',
    date: '2025-10-28',
    description: 'Personal bunker entry setup with heavy sustain and a lock-down shield.',
    tags: ['PvE', 'Solo', 'Close Range'],
    isPublic: true,
    isMine: true,
    build: {
      bag: CATALOG_ITEMS.find((item) => item.id === 'bag-warden') ?? null,
      primary: CATALOG_ITEMS.find((item) => item.id === 'weapon-breaker') as CatalogItem,
      secondary: CATALOG_ITEMS.find((item) => item.id === 'weapon-harrier') as CatalogItem,
      shield: CATALOG_ITEMS.find((item) => item.id === 'shield-heavy') ?? null,
      backpack: [
        CATALOG_ITEMS.find((item) => item.id === 'item-energy-cell') ?? null,
        CATALOG_ITEMS.find((item) => item.id === 'item-medkit') ?? null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      quickUse: [
        CATALOG_ITEMS.find((item) => item.id === 'quick-bandage') ?? null,
        CATALOG_ITEMS.find((item) => item.id === 'quick-stim') ?? null,
        null,
        null,
        null,
        null,
        null,
      ],
      safePocket: [
        CATALOG_ITEMS.find((item) => item.id === 'item-plasma-core') ?? null,
        null,
        null,
        null,
        null,
      ],
    },
  },
  {
    id: 'my-scout',
    name: 'My Scout Loop',
    mode: 'PvAll',
    author: 'You',
    date: '2025-10-05',
    description: 'Recon pathing with safe exits and long sightlines.',
    tags: ['PvE', 'Solo', 'Long Range'],
    isPublic: false,
    isMine: true,
    build: {
      bag: CATALOG_ITEMS.find((item) => item.id === 'bag-survivor-mk3') ?? null,
      primary: CATALOG_ITEMS.find((item) => item.id === 'weapon-longbow') as CatalogItem,
      secondary: CATALOG_ITEMS.find((item) => item.id === 'weapon-harrier') as CatalogItem,
      shield: CATALOG_ITEMS.find((item) => item.id === 'shield-light') ?? null,
      backpack: [
        CATALOG_ITEMS.find((item) => item.id === 'item-energy-cell') ?? null,
        CATALOG_ITEMS.find((item) => item.id === 'item-optic-lens') ?? null,
        CATALOG_ITEMS.find((item) => item.id === 'item-coolant-vial') ?? null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      quickUse: [
        CATALOG_ITEMS.find((item) => item.id === 'quick-bandage') ?? null,
        CATALOG_ITEMS.find((item) => item.id === 'quick-emp') ?? null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      safePocket: [
        CATALOG_ITEMS.find((item) => item.id === 'item-plasma-core') ?? null,
        null,
        null,
        null,
      ],
    },
  },
  {
    id: 'my-urban',
    name: 'My Urban Clash',
    mode: 'PvAll',
    author: 'You',
    date: '2025-10-14',
    description: 'Fast entry kit with quick disengage.',
    tags: ['PvP', 'Solo', 'Close Range'],
    isPublic: true,
    isMine: true,
    build: {
      bag: CATALOG_ITEMS.find((item) => item.id === 'bag-warden') ?? null,
      primary: CATALOG_ITEMS.find((item) => item.id === 'weapon-breaker') as CatalogItem,
      secondary: CATALOG_ITEMS.find((item) => item.id === 'weapon-manticore') as CatalogItem,
      shield: CATALOG_ITEMS.find((item) => item.id === 'shield-medium') ?? null,
      backpack: [
        CATALOG_ITEMS.find((item) => item.id === 'item-armor-patch') ?? null,
        CATALOG_ITEMS.find((item) => item.id === 'item-arc-alloy') ?? null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      quickUse: [
        CATALOG_ITEMS.find((item) => item.id === 'quick-stim') ?? null,
        CATALOG_ITEMS.find((item) => item.id === 'quick-flare') ?? null,
        null,
        null,
        null,
        null,
        null,
      ],
      safePocket: [
        CATALOG_ITEMS.find((item) => item.id === 'item-reactor-shell') ?? null,
        null,
        null,
        null,
        null,
      ],
    },
  },
];

const DEFAULT_SLOTS = {
  backpack: 10,
  quick: 6,
  safe: 3,
};

const attachmentSlots = Array.from({ length: 4 }, (_, index) => index + 1);

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

const getRelativeTime = (timestamp: string) => {
  const created = new Date(timestamp).getTime();
  if (Number.isNaN(created)) return timestamp;
  const now = Date.now();
  const diff = Math.max(0, now - created);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return 'less than a minute ago';
  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  }
  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.floor(diff / day);
  if (days <= 6) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(timestamp);
};

const resizeSlots = (items: (CatalogItem | null)[], size: number) => {
  const next = items.slice(0, size);
  while (next.length < size) next.push(null);
  return next;
};

const collectBuildItems = (
  build: LoadoutBuild,
  primaryAttachments: (CatalogItem | null)[],
  secondaryAttachments: (CatalogItem | null)[]
) => {
  const items: CatalogItem[] = [];
  if (build.bag) items.push(build.bag);
  if (build.primary) items.push(build.primary);
  if (build.secondary) items.push(build.secondary);
  if (build.shield) items.push(build.shield);
  primaryAttachments.forEach((item) => item && items.push(item));
  secondaryAttachments.forEach((item) => item && items.push(item));
  build.backpack.forEach((item) => item && items.push(item));
  build.quickUse.forEach((item) => item && items.push(item));
  build.safePocket.forEach((item) => item && items.push(item));
  return items;
};

const getUniqueListName = (base: string, lists: NeededList[]) => {
  const trimmed = base.trim() || 'Loadout';
  const existingNames = new Set(lists.map((list) => list.name));
  if (!existingNames.has(trimmed)) return trimmed;
  let index = 1;
  while (existingNames.has(`${trimmed} (${index})`)) {
    index += 1;
  }
  return `${trimmed} (${index})`;
};

const tierToRarity = (tier: Tier) => {
  switch (tier) {
    case 'I':
      return 'Common';
    case 'II':
      return 'Uncommon';
    case 'III':
      return 'Rare';
    case 'IV':
      return 'Epic';
    default:
      return 'Common';
  }
};

const makeComment = (partial: Omit<Comment, 'id' | 'createdAt'>): Comment => ({
  id: `comment-${Math.random().toString(36).slice(2, 9)}`,
  createdAt: new Date().toISOString(),
  ...partial,
});

const cloneLoadout = (value: Loadout): Loadout => JSON.parse(JSON.stringify(value)) as Loadout;

const createEmptyLoadout = (): Loadout => ({
  id: 'create',
  name: '',
  mode: 'PvAll',
  author: 'You',
  date: new Date().toISOString(),
  description: '',
  tags: [],
  isPublic: true,
  isMine: true,
  build: {
    bag: null,
    primary: null,
    secondary: null,
    shield: null,
    backpack: Array.from({ length: DEFAULT_SLOTS.backpack }, () => null),
    quickUse: Array.from({ length: DEFAULT_SLOTS.quick }, () => null),
    safePocket: Array.from({ length: DEFAULT_SLOTS.safe }, () => null),
  },
});

const createEmptyBuild = (): LoadoutBuild => ({
  bag: null,
  primary: null,
  secondary: null,
  shield: null,
  backpack: Array.from({ length: DEFAULT_SLOTS.backpack }, () => null),
  quickUse: Array.from({ length: DEFAULT_SLOTS.quick }, () => null),
  safePocket: Array.from({ length: DEFAULT_SLOTS.safe }, () => null),
});

export default function LoadoutDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const loadoutId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const isCreateMode = loadoutId === 'create';

  const [storedLoadouts, setStoredLoadouts] = useState<Loadout[]>([]);
  const baseLoadout = useMemo(() => {
    if (isCreateMode) return createEmptyLoadout();
    return (
      storedLoadouts.find((loadout) => loadout.id === loadoutId) ??
      LOADOUTS.find((loadout) => loadout.id === loadoutId) ??
      LOADOUTS[0]
    );
  }, [isCreateMode, loadoutId, storedLoadouts]);

  const [loadout, setLoadout] = useState<Loadout>(baseLoadout);
  const [lastSavedLoadout, setLastSavedLoadout] = useState<Loadout>(cloneLoadout(baseLoadout));
  const [favorited, setFavorited] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [trackOverlayOpen, setTrackOverlayOpen] = useState(false);
  const [trackedListName, setTrackedListName] = useState<string | null>(null);
  const [selectOverlay, setSelectOverlay] = useState<SlotTarget | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [tierFilter, setTierFilter] = useState('All tiers');
  const [primaryAttachments, setPrimaryAttachments] = useState<(CatalogItem | null)[]>(
    () => Array.from({ length: 4 }, () => null)
  );
  const [secondaryAttachments, setSecondaryAttachments] = useState<(CatalogItem | null)[]>(
    () => Array.from({ length: 4 }, () => null)
  );
  const [reportTarget, setReportTarget] = useState<Comment | null>(null);
  const [reportBody, setReportBody] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [loadoutDeleteOpen, setLoadoutDeleteOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState('');
  const [nameError, setNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const commentEditorRef = useRef<HTMLDivElement | null>(null);
  const [toolbarState, setToolbarState] = useState({
    bold: false,
    italic: false,
    heading: false,
    list: false,
    quote: false,
    code: false,
  });
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackToast, setTrackToast] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'comment-1',
      user: 'NovaVex',
      avatar: 'https://cdn.metaforge.app/avatars/avatar-1.webp',
      body: 'This build carried us through the station. The shield timing is solid.',
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      reaction: null,
    },
    {
      id: 'comment-2',
      user: 'AtlasCrew',
      avatar: 'https://cdn.metaforge.app/avatars/avatar-2.webp',
      body: 'Try swapping the secondary for a burst rifle if you want more poke.',
      createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      reaction: 'like',
    },
    {
      id: 'comment-3',
      user: 'You',
      avatar: 'https://cdn.metaforge.app/avatars/avatar-3.webp',
      body: 'Working on a stealth variant. Will share once I test the bag swap.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      reaction: null,
    },
  ]);

  useEffect(() => {
    setLoadout(baseLoadout);
    setLastSavedLoadout(cloneLoadout(baseLoadout));
    setIsEditing(isCreateMode);
    setTrackedListName(null);
    setPrimaryAttachments(Array.from({ length: 4 }, () => null));
    setSecondaryAttachments(Array.from({ length: 4 }, () => null));
    setNameError(false);
    setDescriptionError(false);
  }, [baseLoadout, isCreateMode]);

  useEffect(() => {
    const stored = localStorage.getItem(LOADOUTS_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Loadout[];
      if (Array.isArray(parsed)) {
        setStoredLoadouts(parsed);
      }
    } catch {
      // ignore storage failures
    }
  }, []);

  const slotCounts = useMemo(() => {
    if (loadout.build.bag?.slots) return loadout.build.bag.slots;
    return {
      backpack: DEFAULT_SLOTS.backpack,
      quick: DEFAULT_SLOTS.quick,
      safe: DEFAULT_SLOTS.safe,
      compatibility: 'No bag selected',
    };
  }, [loadout.build.bag]);

  useEffect(() => {
    setLoadout((prev) => {
      const nextBuild = {
        ...prev.build,
        backpack: resizeSlots(prev.build.backpack, slotCounts.backpack),
        quickUse: resizeSlots(prev.build.quickUse, slotCounts.quick),
        safePocket: resizeSlots(prev.build.safePocket, slotCounts.safe),
      };
      const unchanged =
        nextBuild.backpack.length === prev.build.backpack.length &&
        nextBuild.quickUse.length === prev.build.quickUse.length &&
        nextBuild.safePocket.length === prev.build.safePocket.length;
      if (unchanged) return prev;
      return { ...prev, build: nextBuild };
    });
  }, [slotCounts.backpack, slotCounts.quick, slotCounts.safe]);

  const isOwner = loadout.isMine;
  const canEditSlots = isOwner && isEditing;
  const shareUrl = `https://metaforge.app/arc-raiders/loadouts/share/${loadout.id}`;

  const filledBackpack = loadout.build.backpack.filter(Boolean).length;
  const filledQuick = loadout.build.quickUse.filter(Boolean).length;
  const filledSafe = loadout.build.safePocket.filter(Boolean).length;

  const hasFilters =
    categoryFilter !== 'All categories' || tierFilter !== 'All tiers';

  const filteredCatalog = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    let options = CATALOG_ITEMS;

    if (selectOverlay) {
      if (selectOverlay.type === 'bag') {
        options = options.filter((item) => item.type === 'bag');
      } else if (selectOverlay.type === 'primary' || selectOverlay.type === 'secondary') {
        options = options.filter((item) => item.type === 'weapon');
      } else if (selectOverlay.type === 'shield') {
        options = options.filter((item) => item.type === 'shield');
      } else if (selectOverlay.type === 'quick') {
        options = options.filter((item) => item.type === 'quick');
      } else if (
        selectOverlay.type === 'primary-attachment' ||
        selectOverlay.type === 'secondary-attachment'
      ) {
        options = options.filter(
          (item) => item.type !== 'weapon' && item.type !== 'shield' && item.type !== 'bag'
        );
      } else {
        options = options.filter((item) => item.type !== 'weapon' && item.type !== 'shield' && item.type !== 'bag');
      }
    }

    if (categoryFilter !== 'All categories') {
      options = options.filter((item) => item.category === categoryFilter);
    }

    if (tierFilter !== 'All tiers') {
      options = options.filter((item) => item.tier === tierFilter);
    }

    if (query) {
      options = options.filter((item) => item.name.toLowerCase().includes(query));
    }

    return options;
  }, [searchTerm, categoryFilter, tierFilter, selectOverlay]);

  const toggleTag = (tag: LoadoutTag) => {
    setLoadout((prev) => {
      const tags = prev.tags.includes(tag)
        ? prev.tags.filter((item) => item !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags };
    });
  };

  const handleSelectItem = (item: CatalogItem) => {
    if (!selectOverlay) return;
    setLoadout((prev) => {
      const build = { ...prev.build };
      if (selectOverlay.type === 'bag') build.bag = item;
      if (selectOverlay.type === 'primary') {
        build.primary = item;
        setPrimaryAttachments(Array.from({ length: 4 }, () => null));
      }
      if (selectOverlay.type === 'secondary') {
        build.secondary = item;
        setSecondaryAttachments(Array.from({ length: 4 }, () => null));
      }
      if (selectOverlay.type === 'shield') build.shield = item;
      if (selectOverlay.type === 'primary-attachment') {
        setPrimaryAttachments((prevAttachments) => {
          const next = [...prevAttachments];
          next[selectOverlay.index] = item;
          return next;
        });
      }
      if (selectOverlay.type === 'secondary-attachment') {
        setSecondaryAttachments((prevAttachments) => {
          const next = [...prevAttachments];
          next[selectOverlay.index] = item;
          return next;
        });
      }
      if (selectOverlay.type === 'backpack') {
        const next = [...build.backpack];
        next[selectOverlay.index] = item;
        build.backpack = next;
      }
      if (selectOverlay.type === 'quick') {
        const next = [...build.quickUse];
        next[selectOverlay.index] = item;
        build.quickUse = next;
      }
      if (selectOverlay.type === 'safe') {
        const next = [...build.safePocket];
        next[selectOverlay.index] = item;
        build.safePocket = next;
      }
      return { ...prev, build };
    });
    setSelectOverlay(null);
  };

  const handleTrackItems = () => {
    if (trackLoading) return;
    setTrackLoading(true);
    try {
      const items = collectBuildItems(loadout.build, primaryAttachments, secondaryAttachments);
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? (JSON.parse(stored) as { lists?: NeededList[] }) : null;
      const lists = parsed?.lists ?? [];
      const listName = getUniqueListName(loadout.name || 'Loadout', lists);
      const uniqueItems = new Map<string, CatalogItem>();
      items.forEach((item) => {
        if (!uniqueItems.has(item.id)) {
          uniqueItems.set(item.id, item);
        }
      });
      const listItems: NeededItem[] = Array.from(uniqueItems.values()).map((item, index) => ({
        id: `${item.id}-${index}`,
        name: item.name,
        image: item.image,
        rarity: tierToRarity(item.tier),
        have: 0,
        need: 1,
        subcategories: [
          item.category || 'Loadout',
          `Tier ${item.tier}`,
        ],
      }));
      const subcategoryOrder = Array.from(
        new Set(listItems.flatMap((item) => item.subcategories ?? []))
      );
      const newList: NeededList = {
        id: `loadout-${loadout.id}-${Date.now()}`,
        name: listName,
        type: 'custom',
        items: listItems,
        subcategoryOrder: subcategoryOrder.length > 0 ? subcategoryOrder : ['Loadout'],
      };
      const payload = {
        ...(parsed ?? {}),
        lists: [...lists, newList],
        activeType: 'custom',
        selectedListId: newList.id,
        highlightListId: newList.id,
        importToast: 'Loadout items added to Needed Items',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setTrackedListName(listName);
      setTrackOverlayOpen(false);
      router.push('/needed-items');
    } catch {
      setTrackToast('Failed to track items. Please try again.');
    } finally {
      setTrackLoading(false);
    }
  };

  const handleReset = () => {
    setLoadout((prev) => ({
      ...prev,
      build: createEmptyBuild(),
    }));
    setIsEditing(true);
    setNameError(false);
    setDescriptionError(false);
    setPrimaryAttachments(Array.from({ length: 4 }, () => null));
    setSecondaryAttachments(Array.from({ length: 4 }, () => null));
  };

  const handleUpdate = () => {
    if (isCreateMode) {
      const hasName = Boolean(loadout.name.trim());
      const hasDescription = Boolean(loadout.description.trim());
      setNameError(!hasName);
      setDescriptionError(!hasDescription);
      if (!hasName || !hasDescription) return;
      const newId = `user-${Date.now()}`;
      const nextLoadout: Loadout = {
        ...loadout,
        id: newId,
        name: loadout.name.trim(),
        description: loadout.description.trim(),
        author: 'You',
        isMine: true,
      };
      const nextStored = [...storedLoadouts, nextLoadout];
      try {
        localStorage.setItem(LOADOUTS_STORAGE_KEY, JSON.stringify(nextStored));
      } catch {
        // ignore storage failures
      }
      setStoredLoadouts(nextStored);
      setLastSavedLoadout(cloneLoadout(nextLoadout));
      router.push(`/loadouts/${newId}`);
      return;
    }
    const hasName = Boolean(loadout.name.trim());
    const hasDescription = Boolean(loadout.description.trim());
    setNameError(!hasName);
    setDescriptionError(!hasDescription);
    if (!hasName || !hasDescription) return;
    const nextLoadout: Loadout = {
      ...loadout,
      name: loadout.name.trim(),
      description: loadout.description.trim(),
    };
    const nextStored = storedLoadouts.map((item) =>
      item.id === loadout.id ? nextLoadout : item
    );
    try {
      localStorage.setItem(LOADOUTS_STORAGE_KEY, JSON.stringify(nextStored));
    } catch {
      // ignore storage failures
    }
    setStoredLoadouts(nextStored);
    setLastSavedLoadout(cloneLoadout(nextLoadout));
    setIsEditing(false);
  };

  const handleDeleteLoadout = () => {
    try {
      const stored = localStorage.getItem(LOADOUTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Loadout[];
        if (Array.isArray(parsed)) {
          const next = parsed.filter((item) => item.id !== loadout.id);
          localStorage.setItem(LOADOUTS_STORAGE_KEY, JSON.stringify(next));
        }
      }
    } catch {
      // ignore storage failures
    }
    setLoadoutDeleteOpen(false);
    router.push('/loadouts');
  };

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(shareUrl);
  };

  const addComment = () => {
    if (!commentBody.trim()) return;
    setComments((prev) => [
      makeComment({
        user: 'You',
        avatar: 'https://cdn.metaforge.app/avatars/avatar-3.webp',
        body: commentBody.trim(),
        reaction: null,
      }),
      ...prev,
    ]);
    setCommentBody('');
  };

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentBody(comment.body);
  };

  const saveCommentEdit = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, body: editingCommentBody } : comment
      )
    );
    setEditingCommentId(null);
    setEditingCommentBody('');
  };

  const deleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  const toggleReaction = (commentId: string, reaction: 'like' | 'unlike') => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, reaction: comment.reaction === reaction ? null : reaction }
          : comment
      )
    );
  };

  const execCommand = (command: string, value?: string) => {
    const editor = commentEditorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, value);
    setCommentBody(editor.innerHTML);
  };

  const applyCommentFormat = (
    type: 'bold' | 'italic' | 'heading' | 'list' | 'quote' | 'code' | 'clear'
  ) => {
    if (type === 'bold') return execCommand('bold');
    if (type === 'italic') return execCommand('italic');
    if (type === 'code') return execCommand('formatBlock', 'pre');
    if (type === 'list') return execCommand('insertUnorderedList');
    if (type === 'quote') return execCommand('formatBlock', 'blockquote');
    if (type === 'heading') {
      const isHeading = document.queryCommandValue('formatBlock') === 'h1';
      return execCommand('formatBlock', isHeading ? 'p' : 'h1');
    }
    execCommand('removeFormat');
    execCommand('formatBlock', 'p');
  };

  useEffect(() => {
    const updateToolbar = () => {
      const editor = commentEditorRef.current;
      if (!editor) return;
      const block = document.queryCommandValue('formatBlock')?.toString().toLowerCase();
      setToolbarState({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        heading: block === 'h1',
        list: document.queryCommandState('insertUnorderedList'),
        quote: block === 'blockquote',
        code: block === 'pre',
      });
    };
    document.addEventListener('selectionchange', updateToolbar);
    return () => document.removeEventListener('selectionchange', updateToolbar);
  }, []);

  useEffect(() => {
    if (!trackToast) return;
    const timer = setTimeout(() => setTrackToast(null), 2600);
    return () => clearTimeout(timer);
  }, [trackToast]);

  const bagLabel = loadout.build.bag?.name ?? 'No bag selected';

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="relative w-full px-6 py-10 md:px-10 lg:px-[100px] space-y-10">
        <div className="pointer-events-none absolute -top-16 right-0 h-72 w-72 rounded-full bg-primary/15 blur-[140px]" />
        <div className="pointer-events-none absolute top-32 left-10 h-64 w-64 rounded-full bg-secondary/20 blur-[140px]" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <h1 className="text-3xl md:text-4xl font-bold">Loadout</h1>
            <div className="text-sm text-muted-foreground whitespace-normal">
              Arc Raiders &gt; Loadouts &gt; {loadout.name}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFavorited((prev) => !prev)}
            aria-label="Toggle favourite"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
              favorited
                ? 'border-primary/60 bg-primary/10 text-primary'
                : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
            )}
          >
            {favorited ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        </div>

        <section className="rounded-2xl border border-border bg-card/80 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {isEditing ? (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Loadout Name
                </div>
                <input
                  value={loadout.name}
                  onChange={(event) =>
                    setLoadout((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className={cn(
                    'w-full max-w-[420px] rounded-xl border bg-background px-4 py-2 text-xl font-semibold',
                    nameError ? 'border-destructive' : 'border-border'
                  )}
                />
                {nameError && (
                  <div className="text-xs text-destructive">Loadout name is required.</div>
                )}
              </div>
            ) : (
              <h2 className="text-2xl font-semibold">{loadout.name}</h2>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <User className="h-4 w-4" />
                {loadout.isMine ? (
                  <span className="inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    You
                  </span>
                ) : (
                  <span className="text-foreground">{loadout.author}</span>
                )}
              </div>
              <div className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(loadout.date)}
              </div>
              <div className="inline-flex items-center gap-2">
                {loadout.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {loadout.isPublic ? 'Public' : 'Private'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Description</div>
            {isEditing ? (
              <textarea
                value={loadout.description}
                onChange={(event) =>
                  setLoadout((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={3}
                className={cn(
                  'w-full rounded-xl border bg-background px-4 py-3 text-sm',
                  descriptionError ? 'border-destructive' : 'border-border'
                )}
              />
            ) : (
              <p className="text-sm text-foreground/90">{loadout.description}</p>
            )}
            {isEditing && descriptionError && (
              <div className="text-xs text-destructive">Description is required.</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Tags</div>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const active = loadout.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={!isEditing}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                      active
                        ? 'border-primary/70 bg-primary/10 text-primary'
                        : 'border-border bg-muted/40 text-muted-foreground',
                      isEditing ? 'hover:text-foreground' : 'cursor-default'
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {isOwner && isEditing && (
            <div className="flex items-center gap-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Visibility</div>
              <button
                type="button"
                role="switch"
                aria-checked={loadout.isPublic}
                onClick={() =>
                  setLoadout((prev) => ({ ...prev, isPublic: !prev.isPublic }))
                }
                className={cn(
                  'relative h-8 w-14 rounded-full border transition-colors',
                  loadout.isPublic
                    ? 'border-primary/60 bg-primary/20'
                    : 'border-border bg-muted/40'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 h-6 w-6 rounded-full bg-background shadow transition-all',
                    loadout.isPublic ? 'left-7' : 'left-1'
                  )}
                />
              </button>
              <span className="text-sm text-muted-foreground">
                {loadout.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card/80 p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">Loadout Build</h2>
              {trackedListName && (
                <div className="mt-1 text-xs text-primary">
                  Tracking list created: {trackedListName}
                </div>
              )}
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end lg:w-auto">
              {isOwner && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground sm:w-auto"
                >
                  Edit Loadout
                </button>
              )}
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setTrackOverlayOpen(true)}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground sm:w-auto"
                >
                  Track Items
                </button>
              )}
              {isOwner && isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => setResetConfirmOpen(true)}
                    className="order-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground sm:order-none sm:w-auto"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="order-1 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground sm:order-none sm:w-auto"
                  >
                    {isCreateMode ? 'Save' : 'Update'}
                  </button>
                  {!isCreateMode && (
                    <button
                      type="button"
                      onClick={() => setLoadoutDeleteOpen(true)}
                      className="order-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-destructive px-4 py-2 text-sm font-semibold text-destructive hover:text-destructive sm:order-none sm:w-auto"
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground sm:w-auto"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>

          <div className="grid w-full max-w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="text-base font-semibold sm:text-lg">Loadout Build</div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => canEditSlots && setSelectOverlay({ type: 'bag' })}
                    className={cn(
                      'relative h-16 w-16 overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 transition sm:h-20 sm:w-20',
                      loadout.build.bag ? 'border-solid bg-background/80' : '',
                      canEditSlots ? 'hover:border-primary/60' : 'pointer-events-none'
                    )}
                  >
                    {loadout.build.bag ? (
                      <Image
                        src={loadout.build.bag.image}
                        alt={loadout.build.bag.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Select
                      </div>
                    )}
                  </button>
                  <div className="text-sm text-muted-foreground">
                    <div className="font-semibold text-foreground">Bag</div>
                    {bagLabel}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-base font-semibold sm:text-lg">Equipment</div>
                <div className="space-y-6">
                  <div>
                    <div
                      className={cn(
                        'mt-2 w-full max-w-[400px] overflow-hidden rounded-2xl border border-border bg-background/80 transition',
                        canEditSlots ? 'hover:border-primary/60' : 'pointer-events-none'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => canEditSlots && setSelectOverlay({ type: 'primary' })}
                        className="relative h-[200px] w-full"
                      >
                        {loadout.build.primary ? (
                          <Image
                            src={loadout.build.primary.image}
                            alt={loadout.build.primary.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                            Select Weapon
                          </div>
                        )}
                      </button>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-background/90 px-3 py-1">
                        {attachmentSlots.map((slot, index) => {
                          const attachment = primaryAttachments[index];
                          return (
                            <button
                              key={`primary-attachment-${slot}`}
                              type="button"
                              onClick={() =>
                                canEditSlots && setSelectOverlay({ type: 'primary-attachment', index })
                              }
                              className={cn(
                                'relative h-12 w-12 overflow-hidden rounded-md border border-dashed border-border bg-muted/40 transition',
                                attachment ? 'border-solid bg-background/80' : '',
                                canEditSlots && loadout.build.primary
                                  ? 'hover:border-primary/60'
                                  : 'pointer-events-none'
                              )}
                            >
                              {attachment ? (
                                <Image
                                  src={attachment.image}
                                  alt={attachment.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div
                      className={cn(
                        'mt-2 w-full max-w-[400px] overflow-hidden rounded-2xl border border-border bg-background/80 transition',
                        canEditSlots ? 'hover:border-primary/60' : 'pointer-events-none'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => canEditSlots && setSelectOverlay({ type: 'secondary' })}
                        className="relative h-[200px] w-full"
                      >
                        {loadout.build.secondary ? (
                          <Image
                            src={loadout.build.secondary.image}
                            alt={loadout.build.secondary.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                            Select Weapon
                          </div>
                        )}
                      </button>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-background/90 px-3 py-1">
                        {attachmentSlots.map((slot, index) => {
                          const attachment = secondaryAttachments[index];
                          return (
                            <button
                              key={`secondary-attachment-${slot}`}
                              type="button"
                              onClick={() =>
                                canEditSlots && setSelectOverlay({ type: 'secondary-attachment', index })
                              }
                              className={cn(
                                'relative h-12 w-12 overflow-hidden rounded-md border border-dashed border-border bg-muted/40 transition',
                                attachment ? 'border-solid bg-background/80' : '',
                                canEditSlots && loadout.build.secondary
                                  ? 'hover:border-primary/60'
                                  : 'pointer-events-none'
                              )}
                            >
                              {attachment ? (
                                <Image
                                  src={attachment.image}
                                  alt={attachment.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-base font-semibold sm:text-lg">Shield</div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => canEditSlots && setSelectOverlay({ type: 'shield' })}
                    className={cn(
                      'relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-background/80 transition sm:h-20 sm:w-20',
                      canEditSlots ? 'hover:border-primary/60' : 'pointer-events-none'
                    )}
                  >
                    {loadout.build.shield ? (
                      <Image
                        src={loadout.build.shield.image}
                        alt={loadout.build.shield.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Select
                      </div>
                    )}
                  </button>
                  <div className="text-sm text-muted-foreground">
                    <div className="font-semibold text-foreground">Compatible with:</div>
                    {loadout.build.shield ? (
                      <div>
                        {loadout.build.shield.name}{' '}
                        <span className="text-muted-foreground">
                          ({loadout.build.shield.shieldWeight})
                        </span>
                      </div>
                    ) : (
                      <div>No shield selected</div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            <div className="space-y-4 min-[1535px]:-ml-[0px] min-[1700px]:-ml-[50px] min-[1835px]:-ml-[100px]">
              <div className="sticky top-0 z-10 flex items-center justify-between py-2">
                <div className="text-base font-semibold sm:text-lg">Backpack</div>
                <div className="text-sm text-muted-foreground">
                  {filledBackpack} / {slotCounts.backpack}
                </div>
              </div>
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(64px,1fr))]">
                {loadout.build.backpack.map((item, index) => (
                  <button
                    key={`backpack-${index}`}
                    type="button"
                    onClick={() => canEditSlots && setSelectOverlay({ type: 'backpack', index })}
                    className={cn(
                      'relative aspect-square min-h-[48px] min-w-[48px] overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 text-xs text-muted-foreground transition md:min-h-[64px] md:min-w-[64px]',
                      item ? 'border-solid bg-background/80' : '',
                      canEditSlots ? 'hover:border-primary/60' : 'pointer-events-none'
                    )}
                  >
                    {item ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">{index + 1}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 md:col-span-2 xl:col-span-1">
              <div className="space-y-4">
                <div className="sticky top-0 z-10 flex items-center justify-between py-2">
                  <div className="text-base font-semibold sm:text-lg">Quick Use</div>
                  <div className="text-sm text-muted-foreground">
                    {filledQuick} / {slotCounts.quick}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(64px,1fr))] xl:grid-cols-3">
                  {loadout.build.quickUse.map((item, index) => (
                    <button
                      key={`quick-${index}`}
                      type="button"
                      onClick={() => canEditSlots && setSelectOverlay({ type: 'quick', index })}
                      className={cn(
                        'relative aspect-square min-h-[36px] min-w-[36px] overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 text-xs text-muted-foreground transition md:min-h-[48px] md:min-w-[48px]',
                        item ? 'border-solid bg-background/80' : '',
                        canEditSlots ? 'hover:border-primary/60' : 'pointer-events-none'
                      )}
                    >
                      {item ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">{index + 1}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="sticky top-0 z-10 flex items-center justify-between py-2">
                  <div className="text-base font-semibold sm:text-lg">Safe Pocket</div>
                  <div className="text-sm text-muted-foreground">
                    {filledSafe} / {slotCounts.safe}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(64px,1fr))] xl:grid-cols-3">
                  {loadout.build.safePocket.map((item, index) => (
                    <button
                      key={`safe-${index}`}
                      type="button"
                      onClick={() => canEditSlots && setSelectOverlay({ type: 'safe', index })}
                      className={cn(
                        'relative aspect-square min-h-[36px] min-w-[36px] overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 text-xs text-muted-foreground transition md:min-h-[48px] md:min-w-[48px]',
                        item ? 'border-solid bg-background/80' : '',
                        canEditSlots ? 'hover:border-primary/60' : 'pointer-events-none'
                      )}
                    >
                      {item ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">{index + 1}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {!isCreateMode && (
          <section className="rounded-2xl border border-border bg-card/80 p-6 space-y-6">
            <div className="text-2xl font-semibold">Comments</div>
            <div className="rounded-2xl border border-border bg-background/70 p-4 space-y-4">
              <div className="text-lg font-semibold">Add a Comment</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyCommentFormat('bold')}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                    toolbarState.bold
                      ? 'border-primary/70 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => applyCommentFormat('italic')}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                    toolbarState.italic
                      ? 'border-primary/70 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => applyCommentFormat('heading')}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                    toolbarState.heading
                      ? 'border-primary/70 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => applyCommentFormat('list')}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                    toolbarState.list
                      ? 'border-primary/70 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => applyCommentFormat('quote')}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                    toolbarState.quote
                      ? 'border-primary/70 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  Quote
                </button>
                <button
                  type="button"
                  onClick={() => applyCommentFormat('code')}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                    toolbarState.code
                      ? 'border-primary/70 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  Code
                </button>
                <button
                  type="button"
                  onClick={() => applyCommentFormat('clear')}
                  className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear formatting
                </button>
              </div>
              <div className="relative">
                {!commentBody && (
                  <div className="pointer-events-none absolute left-4 top-3 text-sm text-muted-foreground">
                    Write your comment...
                  </div>
                )}
                <div
                  ref={commentEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(event) =>
                    setCommentBody((event.currentTarget as HTMLDivElement).innerHTML)
                  }
                  className="min-h-[120px] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addComment}
                  className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Post Comment
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {comments.map((comment) => {
                const isOwnerComment = comment.user === 'You';
                const canReport = true;
                const canDelete = isOwner || isOwnerComment;
                const canEdit = isOwnerComment;

                return (
                  <div key={comment.id} className="rounded-2xl border border-border bg-background/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border bg-background">
                          <Image src={comment.avatar} alt={comment.user} fill className="object-cover" />
                        </div>
                        <div>
                        <div className="font-semibold text-foreground">
                          {comment.user === 'You' ? (
                            <span className="inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                              You
                            </span>
                          ) : (
                            comment.user
                          )}
                        </div>
                          <div className="text-xs text-muted-foreground">
                            {getRelativeTime(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {canReport && (
                          <button
                            type="button"
                            onClick={() => {
                              setReportTarget(comment);
                              setReportBody('');
                            }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:text-foreground"
                            aria-label="Report"
                          >
                            <Flag className="h-4 w-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => startEditComment(comment)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:text-foreground"
                            aria-label="Edit"
                          >
                            <Pin className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(comment)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-destructive hover:text-destructive"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      {editingCommentId === comment.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingCommentBody}
                            onChange={(event) => setEditingCommentBody(event.target.value)}
                            rows={3}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => saveCommentEdit(comment.id)}
                              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingCommentBody('');
                              }}
                              className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="text-sm text-foreground/90 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_pre]:rounded-lg [&_pre]:bg-muted/40 [&_pre]:p-3 [&_pre]:text-xs"
                          dangerouslySetInnerHTML={{ __html: comment.body }}
                        />
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleReaction(comment.id, 'like')}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                          comment.reaction === 'like'
                            ? 'border-primary/70 bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Like
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleReaction(comment.id, 'unlike')}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                          comment.reaction === 'unlike'
                            ? 'border-primary/70 bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Unlike
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {trackOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">Track items required for this loadout?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This will add all items in the current loadout to a new custom list in your
                  Needed Items tracker.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrackOverlayOpen(false)}
                className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTrackOverlayOpen(false)}
                disabled={trackLoading}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTrackItems}
                disabled={trackLoading}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {trackLoading ? 'Adding...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {trackToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-border bg-background/90 px-4 py-3 text-sm shadow-lg">
          {trackToast}
        </div>
      )}

      {selectOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-background p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">Select Item</h3>
              <button
                type="button"
                onClick={() => setSelectOverlay(null)}
                className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className={cn(
                  'relative flex-1',
                  hasFilters ? 'max-w-[60%]' : 'w-full'
                )}
              >
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search items"
                  className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm pr-10"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('All categories');
                    setTierFilter('All tiers');
                  }}
                  className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="grid w-full grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
                Category
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="w-full appearance-none rounded-full border border-border bg-background px-4 py-2 pr-10 text-sm text-foreground"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
                Tier
                <div className="relative">
                  <select
                    value={tierFilter}
                    onChange={(event) => setTierFilter(event.target.value)}
                    className="w-full appearance-none rounded-full border border-border bg-background px-4 py-2 pr-10 text-sm text-foreground"
                  >
                    {TIER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-border bg-background/70 p-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCatalog.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className="flex items-center gap-3 text-left text-sm transition-colors hover:text-foreground"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-background">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold">{item.name}</div>
                    </div>
                  </button>
                ))}
                {filteredCatalog.length === 0 && (
                  <div className="col-span-full text-sm text-muted-foreground">
                    No items match the current filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">Report Comment</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please describe the issue with this comment. Reports are reviewed by moderators.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReportTarget(null)}
                className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Description</div>
              <textarea
                value={reportBody}
                onChange={(event) => setReportBody(event.target.value)}
                placeholder="Describe the issue (minimum 10 characters)"
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
              />
              <div className="text-xs text-muted-foreground">
                {reportBody.length} / 10 characters minimum
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportTarget(null)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setReportTarget(null)}
                disabled={reportBody.trim().length < 10}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">Delete Comment</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Are you sure you want to delete this comment? This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              {deleteTarget.body}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteComment(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {loadoutDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">Delete Loadout</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Are you sure you want to delete this loadout? This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLoadoutDeleteOpen(false)}
                className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              {loadout.name || 'Untitled Loadout'}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLoadoutDeleteOpen(false)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteLoadout}
                className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">Reset Loadout</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This will revert the loadout to its last saved state. You can continue editing and save again.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  setResetConfirmOpen(false);
                }}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
