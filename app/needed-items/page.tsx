'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  Filter,
  Pencil,
  Plus,
  Star,
  StarOff,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ListType = 'default' | 'custom';
type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

type Item = {
  id: string;
  name: string;
  image: string;
  rarity: Rarity;
  have: number;
  need: number;
  subcategories?: string[];
};

type ItemList = {
  id: string;
  name: string;
  type: ListType;
  category?: string;
  subcategoryOrder?: string[];
  items: Item[];
};

type Toast = {
  id: string;
  message: string;
};

const STORAGE_KEY = 'arc-needed-items-state';

const catalogItems: Omit<Item, 'have' | 'need'>[] = [
  {
    id: 'arc-alloy',
    name: 'Arc Alloy',
    image: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp',
    rarity: 'Rare',
  },
  {
    id: 'circuit-board',
    name: 'Circuit Board',
    image: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp',
    rarity: 'Uncommon',
  },
  {
    id: 'steel-plate',
    name: 'Steel Plate',
    image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
    rarity: 'Common',
  },
  {
    id: 'energy-cell',
    name: 'Energy Cell',
    image: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp',
    rarity: 'Uncommon',
  },
  {
    id: 'plasma-core',
    name: 'Plasma Core',
    image: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp',
    rarity: 'Epic',
  },
  {
    id: 'nano-fiber',
    name: 'Nano Fiber',
    image: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp',
    rarity: 'Rare',
  },
  {
    id: 'bandage',
    name: 'Bandage',
    image: 'https://cdn.metaforge.app/arc-raiders/items/bandage.webp',
    rarity: 'Common',
  },
  {
    id: 'medical-supplies',
    name: 'Medical Supplies',
    image: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp',
    rarity: 'Uncommon',
  },
  {
    id: 'weapon-blueprint',
    name: 'Weapon Blueprint Cache',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/sentry.webp',
    rarity: 'Legendary',
  },
  {
    id: 'adrenaline-shot',
    name: 'Adrenaline Shot',
    image: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp',
    rarity: 'Rare',
  },
  {
    id: 'armor-patch',
    name: 'Armor Patch',
    image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
    rarity: 'Common',
  },
  {
    id: 'stimulant-kit',
    name: 'Stimulant Kit',
    image: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp',
    rarity: 'Uncommon',
  },
];

const initialLists: ItemList[] = [
  {
    id: 'default-supply',
    name: 'Field Supplies',
    type: 'default',
    subcategoryOrder: ['Materials', 'Energy', 'Medical', 'Tech'],
    items: [
      {
        id: 'steel-plate',
        name: 'Steel Plate',
        image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
        rarity: 'Common',
        have: 4,
        need: 12,
        subcategories: ['Materials'],
      },
      {
        id: 'power-coil',
        name: 'Power Coil',
        image: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp',
        rarity: 'Uncommon',
        have: 1,
        need: 6,
        subcategories: ['Energy'],
      },
      {
        id: 'servo-motor',
        name: 'Servo Motor',
        image: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp',
        rarity: 'Rare',
        have: 0,
        need: 4,
        subcategories: ['Tech'],
      },
      {
        id: 'optic-lens',
        name: 'Optic Lens',
        image: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp',
        rarity: 'Uncommon',
        have: 2,
        need: 5,
        subcategories: ['Tech'],
      },
      {
        id: 'coolant-vial',
        name: 'Coolant Vial',
        image: 'https://cdn.metaforge.app/arc-raiders/items/bandage.webp',
        rarity: 'Common',
        have: 3,
        need: 7,
        subcategories: ['Medical'],
      },
      {
        id: 'titan-scrap',
        name: 'Titan Scrap',
        image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
        rarity: 'Common',
        have: 0,
        need: 9,
        subcategories: ['Materials'],
      },
      {
        id: 'relay-core',
        name: 'Relay Core',
        image: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp',
        rarity: 'Epic',
        have: 1,
        need: 2,
        subcategories: ['Energy'],
      },
      {
        id: 'targeting-array',
        name: 'Targeting Array',
        image: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp',
        rarity: 'Rare',
        have: 2,
        need: 6,
        subcategories: ['Tech'],
      },
      {
        id: 'shield-emitter',
        name: 'Shield Emitter',
        image: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp',
        rarity: 'Rare',
        have: 0,
        need: 3,
        subcategories: ['Tech'],
      },
      {
        id: 'fusion-tube',
        name: 'Fusion Tube',
        image: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp',
        rarity: 'Uncommon',
        have: 4,
        need: 8,
        subcategories: ['Energy'],
      },
      {
        id: 'data-slate',
        name: 'Data Slate',
        image: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp',
        rarity: 'Uncommon',
        have: 1,
        need: 4,
        subcategories: ['Tech'],
      },
      {
        id: 'stabilizer-ring',
        name: 'Stabilizer Ring',
        image: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp',
        rarity: 'Rare',
        have: 0,
        need: 5,
        subcategories: ['Materials'],
      },
      {
        id: 'reactor-foil',
        name: 'Reactor Foil',
        image: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp',
        rarity: 'Rare',
        have: 2,
        need: 7,
        subcategories: ['Materials'],
      },
      {
        id: 'signal-amplifier',
        name: 'Signal Amplifier',
        image: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp',
        rarity: 'Uncommon',
        have: 3,
        need: 6,
        subcategories: ['Tech'],
      },
      {
        id: 'energy-cell',
        name: 'Energy Cell',
        image: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp',
        rarity: 'Uncommon',
        have: 2,
        need: 8,
        subcategories: ['Energy'],
      },
      {
        id: 'bandage',
        name: 'Bandage',
        image: 'https://cdn.metaforge.app/arc-raiders/items/bandage.webp',
        rarity: 'Common',
        have: 5,
        need: 5,
        subcategories: ['Medical'],
      },
      {
        id: 'nano-fiber',
        name: 'Nano Fiber',
        image: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp',
        rarity: 'Rare',
        have: 1,
        need: 4,
        subcategories: ['Materials'],
      },
    ],
  },
  {
    id: 'default-workshop',
    name: 'Workshop Queue',
    type: 'default',
    subcategoryOrder: ['Metal', 'Tech', 'Cores'],
    items: [
      {
        id: 'circuit-board',
        name: 'Circuit Board',
        image: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp',
        rarity: 'Uncommon',
        have: 1,
        need: 6,
        subcategories: ['Tech'],
      },
      {
        id: 'arc-alloy',
        name: 'Arc Alloy',
        image: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp',
        rarity: 'Rare',
        have: 2,
        need: 5,
        subcategories: ['Metal'],
      },
      {
        id: 'plasma-core',
        name: 'Plasma Core',
        image: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp',
        rarity: 'Epic',
        have: 0,
        need: 2,
        subcategories: ['Cores'],
      },
    ],
  },
  {
    id: 'default-loadout',
    name: 'Daily Loadout',
    type: 'default',
    subcategoryOrder: ['Medical', 'Armor', 'Combat'],
    items: [
      {
        id: 'medical-supplies',
        name: 'Medical Supplies',
        image: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp',
        rarity: 'Uncommon',
        have: 1,
        need: 3,
        subcategories: ['Medical'],
      },
      {
        id: 'adrenaline-shot',
        name: 'Adrenaline Shot',
        image: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp',
        rarity: 'Rare',
        have: 0,
        need: 2,
        subcategories: ['Combat'],
      },
      {
        id: 'armor-patch',
        name: 'Armor Patch',
        image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
        rarity: 'Common',
        have: 6,
        need: 9,
        subcategories: ['Armor'],
      },
    ],
  },
  {
    id: 'custom-loadout',
    name: 'Squad Loadout',
    type: 'custom',
    category: 'Weekend Push',
    subcategoryOrder: ['Weekend Push'],
    items: [
      {
        id: 'medical-supplies',
        name: 'Medical Supplies',
        image: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp',
        rarity: 'Uncommon',
        have: 2,
        need: 5,
        subcategories: ['Weekend Push'],
      },
      {
        id: 'adrenaline-shot',
        name: 'Adrenaline Shot',
        image: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp',
        rarity: 'Rare',
        have: 1,
        need: 4,
        subcategories: ['Weekend Push'],
      },
      {
        id: 'energy-cell',
        name: 'Energy Cell',
        image: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp',
        rarity: 'Uncommon',
        have: 3,
        need: 6,
        subcategories: ['Weekend Push'],
      },
    ],
  },
];

const listTypeLabels: Record<'default' | 'custom' | 'all', string> = {
  default: 'Default Lists',
  custom: 'Custom Lists',
  all: 'All Lists',
};

const rarityOptions: (Rarity | 'All rarities')[] = [
  'All rarities',
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
];

const sortOptions = ['Default', 'Closest to complete first'] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getProgress(item: Item) {
  if (item.need <= 0) {
    return 0;
  }
  return clamp(item.have / item.need, 0, 1);
}

function aggregateItems(lists: ItemList[]) {
  const map = new Map<string, Item>();
  lists.forEach((list) => {
    list.items.forEach((item) => {
      const existing = map.get(item.id);
      if (existing) {
        existing.need += item.need;
        existing.have += item.have;
      } else {
        map.set(item.id, { ...item });
      }
    });
  });
  return Array.from(map.values());
}

function getListProgress(list: ItemList) {
  const totalNeed = list.items.reduce((sum, item) => sum + item.need, 0);
  const totalHave = list.items.reduce((sum, item) => sum + Math.min(item.have, item.need), 0);
  const percent = totalNeed > 0 ? Math.round((totalHave / totalNeed) * 100) : 0;
  return { totalNeed, totalHave, percent };
}

function getItemSubcategories(item: Item) {
  return item.subcategories && item.subcategories.length > 0 ? item.subcategories : ['Unsorted'];
}

function getListSubcategories(list: ItemList) {
  const base = list.subcategoryOrder && list.subcategoryOrder.length > 0 ? list.subcategoryOrder : [];
  const fromItems = Array.from(
    new Set(
      list.items.flatMap((item) => getItemSubcategories(item))
    )
  );
  const merged = [...base, ...fromItems.filter((sub) => !base.includes(sub))];
  return merged.length > 0 ? merged : ['General'];
}

function normalizeSubcategories(input: string[]) {
  const cleaned = input.map((item) => item.trim()).filter(Boolean);
  return cleaned.length > 0 ? Array.from(new Set(cleaned)) : ['General'];
}

export default function NeededItemsPage() {
  const [favorited, setFavorited] = useState(false);
  const [lists, setLists] = useState<ItemList[]>(initialLists);
  const [activeType, setActiveType] = useState<ListType | 'all'>('default');
  const [selectedListId, setSelectedListId] = useState<string>('default-supply');
  const [manageOpen, setManageOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showCollected, setShowCollected] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'All rarities'>('All rarities');
  const [sortOrder, setSortOrder] = useState<(typeof sortOptions)[number]>('Default');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newListOpen, setNewListOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListCategory, setNewListCategory] = useState('');
  const [newListItems, setNewListItems] = useState<Item[]>([]);
  const [searchCatalog, setSearchCatalog] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newListSubcategories, setNewListSubcategories] = useState<string[]>([]);
  const [editListId, setEditListId] = useState<string | null>(null);
  const [editListType, setEditListType] = useState<ListType | null>(null);
  const [editListName, setEditListName] = useState('');
  const [editSubcategories, setEditSubcategories] = useState<string[]>([]);
  const [editSubcategoryName, setEditSubcategoryName] = useState('');
  const [editListItems, setEditListItems] = useState<Item[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [expandedLists, setExpandedLists] = useState<string[]>([]);
  const [listOrders, setListOrders] = useState<Record<string, string[]>>({});
  const sortTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sortCountdown, setSortCountdown] = useState<number | null>(null);
  const [activeSubcategoryByList, setActiveSubcategoryByList] = useState<Record<string, string>>({});
  const subcategoryRefs = useRef<Record<string, Record<string, HTMLDivElement | null>>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          lists?: ItemList[];
          activeType?: ListType | 'all';
          selectedListId?: string;
          showCollected?: boolean;
          favorited?: boolean;
        };
        if (parsed.lists) {
          const cleaned = parsed.lists
            .filter((list) => list.type === 'default' || list.type === 'custom')
            .map((list) => {
              const subcategoryOrder = normalizeSubcategories(list.subcategoryOrder ?? []);
              const items = list.items.map((item) => ({
                ...item,
                subcategories:
                  item.subcategories && item.subcategories.length > 0
                    ? item.subcategories
                    : [subcategoryOrder[0]],
              }));
              return { ...list, subcategoryOrder, items };
            });
          setLists(cleaned);
        }
        if (parsed.activeType) {
          setActiveType(parsed.activeType);
        }
        if (parsed.selectedListId) {
          setSelectedListId(parsed.selectedListId);
        }
        if (typeof parsed.showCollected === 'boolean') {
          setShowCollected(parsed.showCollected);
        }
        if (typeof parsed.favorited === 'boolean') {
          setFavorited(parsed.favorited);
        }
      } catch {
        // ignore invalid storage
      }
    }
  }, []);

  useEffect(() => {
    const payload = {
      lists,
      activeType,
      selectedListId,
      showCollected,
      favorited,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [lists, activeType, selectedListId, showCollected, favorited]);

  useEffect(() => {
    if (activeType === 'all') {
      setSelectedListId('all');
      return;
    }
    const candidates = lists.filter((list) => list.type === activeType);
    if (!candidates.find((list) => list.id === selectedListId)) {
      if (candidates[0]) {
        setSelectedListId(candidates[0].id);
      }
    }
  }, [activeType, lists, selectedListId]);

  useEffect(() => {
    if (!manageOpen) return;
    if (activeType === 'all') {
      const defaultList = lists.find((list) => list.type === 'default') ?? lists[0];
      if (defaultList) {
        setActiveType(defaultList.type);
        setSelectedListId(defaultList.id);
      }
    }
  }, [manageOpen, activeType, lists]);

  const visibleLists = useMemo(() => {
    if (activeType === 'all') {
      return lists;
    }
    return lists.filter((list) => list.type === activeType);
  }, [activeType, lists]);

  const selectedList = useMemo(() => {
    if (activeType === 'all') {
      return null;
    }
    return lists.find((list) => list.id === selectedListId) ?? visibleLists[0] ?? null;
  }, [activeType, lists, selectedListId, visibleLists]);

  useEffect(() => {
    if (!expandedLists.length) return;
    const observers: IntersectionObserver[] = [];

    expandedLists.forEach((listId) => {
      const list = visibleLists.find((item) => item.id === listId);
      if (!list) return;
      const subcategories = getListSubcategories(list);
      if (!activeSubcategoryByList[listId] && subcategories[0]) {
        setActiveSubcategoryByList((prev) => ({ ...prev, [listId]: subcategories[0] }));
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const subcategory = (entry.target as HTMLElement).dataset.subcategory;
              if (!subcategory) return;
              setActiveSubcategoryByList((prev) => ({ ...prev, [listId]: subcategory }));
            }
          });
        },
        { rootMargin: '-35% 0px -55% 0px', threshold: 0.1 }
      );

      const refs = subcategoryRefs.current[listId] ?? {};
      Object.values(refs).forEach((node) => {
        if (node) observer.observe(node);
      });

      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [expandedLists, visibleLists, activeSubcategoryByList]);

  const getSortedIds = (items: Item[]) =>
    [...items]
      .sort((a, b) => {
        const aComplete = a.need > 0 && a.have >= a.need;
        const bComplete = b.need > 0 && b.have >= b.need;
        if (aComplete !== bComplete) return aComplete ? 1 : -1;
        const progressDiff = getProgress(b) - getProgress(a);
        if (progressDiff !== 0) return progressDiff;
        return a.name.localeCompare(b.name);
      })
      .map((item) => item.id);

  useEffect(() => {
    if (!selectedList || !manageOpen) return;
    setListOrders((prev) => ({
      ...prev,
      [selectedList.id]: getSortedIds(selectedList.items),
    }));
  }, [manageOpen, selectedList?.id]);

  const trackedItems = useMemo(() => {
    if (activeType === 'all') {
      const rawItems = aggregateItems(lists);
      const filtered = rawItems.filter((item) => {
        if (!showCollected && item.need > 0 && item.have >= item.need) {
          return false;
        }
        if (rarityFilter !== 'All rarities' && item.rarity !== rarityFilter) {
          return false;
        }
        if (searchTerm.trim()) {
          return item.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
      });

      const applyProgressSort = sortOrder === 'Closest to complete first' || sortOrder === 'Default';
      if (applyProgressSort) {
        filtered.sort((a, b) => {
          const aComplete = a.need > 0 && a.have >= a.need;
          const bComplete = b.need > 0 && b.have >= b.need;
          if (aComplete !== bComplete) return aComplete ? 1 : -1;
          const progressDiff = getProgress(b) - getProgress(a);
          if (progressDiff !== 0) return progressDiff;
          return a.name.localeCompare(b.name);
        });
      }
      return filtered;
    }

    const items = selectedList?.items ?? [];
    const order = listOrders[selectedList?.id ?? ''] ?? getSortedIds(items);
    const orderedItems = order
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is Item => Boolean(item));

    const filtered = orderedItems.filter((item) => {
      if (!showCollected && item.need > 0 && item.have >= item.need) {
        return false;
      }
      if (rarityFilter !== 'All rarities' && item.rarity !== rarityFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        return item.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });

    if (sortOrder === 'Closest to complete first') {
      filtered.sort((a, b) => {
        const aComplete = a.need > 0 && a.have >= a.need;
        const bComplete = b.need > 0 && b.have >= b.need;
        if (aComplete !== bComplete) return aComplete ? 1 : -1;
        const progressDiff = getProgress(b) - getProgress(a);
        if (progressDiff !== 0) return progressDiff;
        return a.name.localeCompare(b.name);
      });
    }

    return filtered;
  }, [activeType, lists, selectedList, showCollected, rarityFilter, searchTerm, sortOrder, listOrders]);

  const trackedProgress = useMemo(() => {
    const listItems = activeType === 'all' ? aggregateItems(lists) : selectedList?.items ?? [];
    const totalNeed = listItems.reduce((sum, item) => sum + item.need, 0);
    const totalHave = listItems.reduce((sum, item) => sum + Math.min(item.have, item.need), 0);
    const percent = totalNeed > 0 ? Math.round((totalHave / totalNeed) * 100) : 0;
    return { totalNeed, totalHave, percent };
  }, [activeType, lists, selectedList]);

  const addToast = (message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2600);
  };

  const scheduleListSort = (listId: string, items: Item[]) => {
    const existing = sortTimersRef.current[listId];
    if (existing) {
      clearTimeout(existing);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setSortCountdown(3);
    countdownRef.current = setInterval(() => {
      setSortCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    sortTimersRef.current[listId] = setTimeout(() => {
      setListOrders((prevOrders) => ({
        ...prevOrders,
        [listId]: getSortedIds(items),
      }));
      sortTimersRef.current[listId] = null;
      setSortCountdown(null);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }, 3000);
  };

  const clearPendingSort = (listId: string) => {
    const existing = sortTimersRef.current[listId];
    if (existing) {
      clearTimeout(existing);
      sortTimersRef.current[listId] = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setSortCountdown(null);
  };

  const updateItem = (
    listId: string,
    itemId: string,
    updates: Partial<Item>,
    options?: { deferSort?: boolean; immediateSort?: boolean }
  ) => {
    setLists((prev) => {
      const nextLists = prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) => {
                if (item.id !== itemId) return item;
                const next = { ...item, ...updates };
                if (next.need < 0) next.need = 0;
                if (next.have < 0) next.have = 0;
                if (next.have > next.need) next.have = next.need;
                return next;
              }),
            }
          : list
      );

      if (manageOpen && listId === selectedListId) {
        const updatedList = nextLists.find((list) => list.id === listId);
        if (updatedList) {
          if (options?.immediateSort) {
            clearPendingSort(listId);
            setListOrders((prevOrders) => ({
              ...prevOrders,
              [listId]: getSortedIds(updatedList.items),
            }));
          } else if (options?.deferSort) {
            scheduleListSort(listId, updatedList.items);
          } else {
            setListOrders((prevOrders) => ({
              ...prevOrders,
              [listId]: getSortedIds(updatedList.items),
            }));
          }
        }
      }

      return nextLists;
    });
  };

  const deleteList = (listId: string) => {
    setLists((prev) => prev.filter((list) => list.id !== listId));
    addToast('List deleted.');
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const id = `custom-${Date.now()}`;
    const subcategories = normalizeSubcategories(newListSubcategories);
    const listItems = newListItems.map((item) => ({
      ...item,
      subcategories: item.subcategories && item.subcategories.length > 0 ? item.subcategories : [subcategories[0]],
    }));
    const nextList: ItemList = {
      id,
      name: newListName.trim(),
      type: 'custom',
      category: newListCategory.trim() || undefined,
      subcategoryOrder: subcategories,
      items: listItems,
    };
    setLists((prev) => [nextList, ...prev]);
    setActiveType('custom');
    setSelectedListId(id);
    setNewListName('');
    setNewListCategory('');
    setNewListItems([]);
    setSearchCatalog('');
    setNewListSubcategories([]);
    setNewSubcategoryName('');
    setNewListOpen(false);
    addToast('List created.');
  };

  const handleAddItemsToList = (listId: string) => {
    if (!newListItems.length) {
      setAddItemOpen(false);
      return;
    }
    setLists((prev) =>
      prev.map((list) => {
        if (list.id !== listId) return list;
        const subcategories = normalizeSubcategories(list.subcategoryOrder ?? []);
        const existingIds = new Set(list.items.map((item) => item.id));
        const additions = newListItems
          .filter((item) => !existingIds.has(item.id))
          .map((item) => ({
            ...item,
            subcategories: item.subcategories && item.subcategories.length > 0 ? item.subcategories : [subcategories[0]],
          }));
        return { ...list, items: [...list.items, ...additions] };
      })
    );
    setNewListItems([]);
    setSearchCatalog('');
    setAddItemOpen(false);
    addToast('Items added.');
  };

  const resetNewListState = () => {
    setNewListName('');
    setNewListCategory('');
    setNewListItems([]);
    setSearchCatalog('');
    setNewListSubcategories([]);
    setNewSubcategoryName('');
  };

  const openEditOverlay = (list: ItemList) => {
    setEditListId(list.id);
    setEditListType(list.type);
    setEditListName(list.name);
    const normalizedSubs = getListSubcategories(list);
    setEditSubcategories(normalizedSubs);
    setEditSubcategoryName('');
    setDragIndex(null);
    setEditListItems(
      list.items.map((item) => ({
        ...item,
        subcategories: getItemSubcategories(item),
      }))
    );
  };

  const handleSaveEditList = () => {
    if (!editListId) return;
    const nextSubcategories = normalizeSubcategories(editSubcategories);
    setLists((prev) =>
      prev.map((list) => {
        if (list.id !== editListId) return list;
        const updatedItems = list.items.map((item) => {
          const edited = editListItems.find((entry) => entry.id === item.id);
          const subs = edited
            ? getItemSubcategories(edited).filter((sub) => nextSubcategories.includes(sub))
            : getItemSubcategories(item).filter((sub) => nextSubcategories.includes(sub));
          return {
            ...(edited ?? item),
            subcategories: subs.length > 0 ? subs : [nextSubcategories[0]],
          };
        });
        return {
          ...list,
          name: editListName.trim() || list.name,
          subcategoryOrder: nextSubcategories,
          items: updatedItems,
        };
      })
    );
    setEditListId(null);
    setEditListType(null);
    setEditListName('');
    setEditSubcategories([]);
    setEditListItems([]);
    addToast('List updated.');
  };

  const toggleNewItemSubcategory = (itemId: string, subcategory: string) => {
    const available = normalizeSubcategories(newListSubcategories);
    setNewListItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const subs = getItemSubcategories(item);
        const has = subs.includes(subcategory);
        const next = has ? subs.filter((sub) => sub !== subcategory) : [...subs, subcategory];
        return {
          ...item,
          subcategories: next.length > 0 ? next : [available[0]],
        };
      })
    );
  };

  const toggleEditItemSubcategory = (itemId: string, subcategory: string) => {
    const available = normalizeSubcategories(editSubcategories);
    setEditListItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const subs = getItemSubcategories(item);
        const has = subs.includes(subcategory);
        let next = has ? subs.filter((sub) => sub !== subcategory) : [...subs, subcategory];
        if (editListType === 'default') {
          next = [subcategory];
        }
        return {
          ...item,
          subcategories: next.length > 0 ? next : [available[0]],
        };
      })
    );
  };

  const searchSource = useMemo(() => {
    const map = new Map<string, Omit<Item, 'have' | 'need'>>();
    catalogItems.forEach((item) => {
      map.set(item.id, item);
    });
    lists.forEach((list) => {
      list.items.forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, {
            id: item.id,
            name: item.name,
            image: item.image,
            rarity: item.rarity,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [lists]);

  const catalogResults = useMemo(() => {
    const query = searchCatalog.trim().toLowerCase();
    if (query.length < 2) {
      return [];
    }
    return searchSource.filter((item) => item.name.toLowerCase().includes(query));
  }, [searchCatalog, searchSource]);

  const toggleCatalogItem = (item: Omit<Item, 'have' | 'need'>) => {
    setNewListItems((prev) => {
      if (prev.find((selected) => selected.id === item.id)) {
        return prev.filter((selected) => selected.id !== item.id);
      }
      const defaultSubcategory = addItemOpen && selectedList
        ? normalizeSubcategories(selectedList.subcategoryOrder ?? [])[0]
        : normalizeSubcategories(newListSubcategories)[0];
      return [...prev, { ...item, have: 0, need: 1, subcategories: [defaultSubcategory] }];
    });
  };

  const toggleListExpanded = (listId: string) => {
    setExpandedLists((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
  };

  const isAllLists = activeType === 'all';
  const allowItemEdits = !isAllLists && !!selectedList;

  return (
    <main className="min-h-screen scroll-smooth">
      <div className="relative w-full px-[100px] py-10 space-y-8">
        <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-primary/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-20 left-10 h-48 w-48 rounded-full bg-secondary/20 blur-[100px]" />

        <div className="relative flex flex-nowrap items-center justify-between gap-4">
          <div className="flex flex-nowrap items-center gap-4">
            <div className="flex flex-nowrap items-end gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Needed Items</h1>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                Arc Raiders &gt; Needed Items
              </div>
            </div>
          </div>
          <button
            onClick={() => setFavorited((prev) => !prev)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
              favorited
                ? 'border-primary/70 bg-primary/10 text-primary'
                : 'border-border bg-muted/40 text-foreground hover:border-primary/60'
            )}
          >
            {favorited ? <Star className="w-4 h-4 fill-primary text-primary" /> : <StarOff className="w-4 h-4" />}
            {favorited ? 'Added to favourite' : 'Add to Favourite'}
          </button>
        </div>

        {!manageOpen && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(listTypeLabels) as ('default' | 'custom' | 'all')[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveType(key)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                    activeType === key
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {listTypeLabels[key]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setManageOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-semibold hover:border-primary/60 transition-colors"
              >
                Manage Lists
              </button>
              <button
                onClick={() => {
                  resetNewListState();
                  setAddItemOpen(false);
                  setManageOpen(false);
                  setNewListOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New List
              </button>
            </div>
          </div>
        )}


        {manageOpen && (
          <section className="rounded-3xl border border-border bg-card/80 p-6 shadow-xl shadow-primary/10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">Lists</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Edit item amounts, clear tracked entries, remove lists, or add new ones from here.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setManageOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-semibold hover:border-primary/60 transition-colors"
                >
                  Back to Overview
                </button>
                <button
                  onClick={() => {
                    resetNewListState();
                    setAddItemOpen(false);
                    setManageOpen(false);
                    setNewListOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New List
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Default Lists
                </h4>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {lists.filter((list) => list.type === 'default').map((list) => {
                    const progress = getListProgress(list);
                    return (
                      <div
                        key={list.id}
                        onClick={() => {
                          setActiveType('default');
                          setSelectedListId(list.id);
                          setManageOpen(true);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setActiveType('default');
                            setSelectedListId(list.id);
                            setManageOpen(true);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          'w-full text-left rounded-2xl border bg-background/60 p-4 transition-colors hover:border-primary/60',
                          selectedListId === list.id ? 'border-primary/70' : 'border-border'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1 max-w-[50%]">
                            <div className="font-semibold break-words whitespace-normal">{list.name}</div>
                          </div>
                          <div className="ml-auto flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                              <span className="font-semibold text-foreground">{progress.percent}%</span>
                              <span>{progress.totalHave} / {progress.totalNeed}</span>
                            </div>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                openEditOverlay(list);
                              }}
                              className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
                              aria-label="Edit list"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-muted/70 overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${progress.percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Custom Lists
                </h4>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {lists.filter((list) => list.type === 'custom').map((list) => {
                    const progress = getListProgress(list);
                    return (
                      <div
                        key={list.id}
                        onClick={() => {
                          setActiveType('custom');
                          setSelectedListId(list.id);
                          setManageOpen(true);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setActiveType('custom');
                            setSelectedListId(list.id);
                            setManageOpen(true);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          'w-full text-left rounded-2xl border bg-background/60 p-4 transition-colors hover:border-primary/60',
                          selectedListId === list.id ? 'border-primary/70' : 'border-border'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1 max-w-[50%]">
                            <div className="font-semibold break-words whitespace-normal">{list.name}</div>
                          </div>
                          <div className="ml-auto flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                              <span className="font-semibold text-foreground">{progress.percent}%</span>
                              <span>{progress.totalHave} / {progress.totalNeed}</span>
                            </div>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                openEditOverlay(list);
                              }}
                              className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
                              aria-label="Edit list"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteList(list.id);
                              }}
                              className="rounded-full border border-border p-2 text-muted-foreground hover:text-destructive"
                              aria-label="Delete list"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-muted/70 overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${progress.percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {manageOpen && (
          <section className="rounded-3xl border border-border bg-card/70 p-6 shadow-lg shadow-primary/10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-bold">Tracked Items</h3>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {trackedProgress.percent}% &nbsp; {trackedProgress.totalHave} / {trackedProgress.totalNeed} items
                </div>
                {sortCountdown !== null && (
                  <div className="text-xs text-muted-foreground">
                    Resorting in {sortCountdown}s
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
              {selectedList?.type === 'custom' && (
                <button
                  onClick={() => {
                    resetNewListState();
                    setAddItemOpen(true);
                  }}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                )}
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-semibold hover:border-primary/60 transition-colors"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <div className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Show Collected Items</span>
                <button
                  onClick={() => setShowCollected((prev) => !prev)}
                  className={cn(
                    'relative h-5 w-10 rounded-full transition-colors',
                    showCollected ? 'bg-primary/70' : 'bg-muted'
                  )}
                  aria-label="Toggle collected items"
                >
                  <span
                    className={cn(
                      'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background transition-transform',
                      showCollected ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
                </div>
              </div>
            </div>

            {!isAllLists && visibleLists.length > 0 && !selectedListId && (
              <div className="text-sm text-muted-foreground">
                Select a list to view its tracked items.
              </div>
            )}

            {showFilters && (
              <div className="grid gap-4 rounded-2xl border border-border bg-background/70 p-4 md:grid-cols-[1.4fr,1fr]">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Filters</div>
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by item name"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Order by rarity</div>
                  <select
                    value={rarityFilter}
                    onChange={(event) => setRarityFilter(event.target.value as Rarity | 'All rarities')}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    {rarityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

          <div className="rounded-2xl border border-border bg-background/70 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="text-sm font-semibold">In This List</div>
              {isAllLists && (
                <div className="text-xs text-muted-foreground">Combined lists are read-only</div>
              )}
            </div>
            <div className="px-4 py-2 border-b border-border text-xs uppercase tracking-wide text-muted-foreground hidden md:grid grid-cols-[220px_1fr_125px_30px_125px_180px_100px] items-center">
              <div>Item</div>
              <div />
              <div className="text-center">Have</div>
              <div />
              <div className="text-center">Need</div>
              <div className="text-center">Progress</div>
              <div className="text-center">Actions</div>
            </div>
            <div className="divide-y divide-border overflow-x-auto">
              {trackedItems.map((item) => {
                const progress = Math.round(getProgress(item) * 100);
                const isComplete = item.need > 0 && item.have >= item.need;
                return (
                  <div
                    key={`${item.id}-${item.name}`}
                    className={cn(
                      'grid grid-cols-[220px_1fr_125px_30px_125px_180px_100px] items-center px-4 py-4 min-w-[860px]',
                      isComplete ? 'opacity-60' : 'opacity-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border/60 bg-background/80">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.rarity}</div>
                      </div>
                    </div>
                    <div />
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() =>
                            allowItemEdits &&
                            updateItem(
                              selectedListId,
                              item.id,
                              { have: clamp(item.have - 1, 0, item.need) },
                              { deferSort: true }
                            )
                          }
                          disabled={!allowItemEdits}
                          className="h-8 w-8 rounded-full border border-border text-sm font-semibold disabled:opacity-40"
                        >
                          -
                        </button>
                        <div className="w-10 text-center text-sm font-semibold">{item.have}</div>
                        <button
                          onClick={() =>
                            allowItemEdits &&
                            updateItem(
                              selectedListId,
                              item.id,
                              { have: clamp(item.have + 1, 0, item.need) },
                              { deferSort: true }
                            )
                          }
                          disabled={!allowItemEdits}
                          className="h-8 w-8 rounded-full border border-border text-sm font-semibold disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div />
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() =>
                            allowItemEdits &&
                            updateItem(
                              selectedListId,
                              item.id,
                              { need: Math.max(0, item.need - 1) },
                              { deferSort: true }
                            )
                          }
                          disabled={!allowItemEdits}
                          className="h-8 w-8 rounded-full border border-border text-sm font-semibold disabled:opacity-40"
                        >
                          -
                        </button>
                        <div className="w-10 text-center text-sm font-semibold">{item.need}</div>
                        <button
                          onClick={() =>
                            allowItemEdits &&
                            updateItem(
                              selectedListId,
                              item.id,
                              { need: item.need + 1 },
                              { deferSort: true }
                            )
                          }
                          disabled={!allowItemEdits}
                          className="h-8 w-8 rounded-full border border-border text-sm font-semibold disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-muted/70 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground">{progress}%</div>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={() =>
                          allowItemEdits &&
                          updateItem(selectedListId, item.id, { have: item.need }, { immediateSort: true })
                        }
                        disabled={!allowItemEdits}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold disabled:opacity-40"
                      >
                        Collect
                      </button>
                      <button
                        onClick={() =>
                          allowItemEdits &&
                          updateItem(selectedListId, item.id, { have: 0 }, { immediateSort: true })
                        }
                        disabled={!allowItemEdits}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground disabled:opacity-40"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                );
              })}
                {trackedItems.length === 0 && (
                  <div className="px-4 py-6 text-sm text-muted-foreground">No tracked items found.</div>
                )}
              </div>
            </div>
          </section>
        )}

        {!manageOpen && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Needed Lists</h3>
              <div className="text-sm text-muted-foreground">Sorted by completion progress</div>
            </div>
            <div className="space-y-6">
            {visibleLists.map((list) => {
              const sortedItems = [...list.items].sort((a, b) => {
                const aComplete = a.need > 0 && a.have >= a.need;
                const bComplete = b.need > 0 && b.have >= b.need;
                if (aComplete !== bComplete) return aComplete ? 1 : -1;
                if (!aComplete && !bComplete) {
                  const progressDiff = getProgress(b) - getProgress(a);
                  if (progressDiff !== 0) return progressDiff;
                }
                return a.name.localeCompare(b.name);
              });
              const visibleItems = showCollected
                ? sortedItems
                : sortedItems.filter((item) => item.need <= 0 || item.have < item.need);
              const listProgress = getListProgress(list);
              const isExpanded = expandedLists.includes(list.id);
              return (
                <div
                  key={list.id}
                  className="rounded-3xl border border-border bg-card/70 p-6"
                >
                  <button
                    onClick={() => toggleListExpanded(list.id)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-xl font-semibold">{list.name}</h4>
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {list.type === 'custom' ? 'Custom' : 'Default'}
                      </span>
                      {list.category && (
                        <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {list.category}
                        </span>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{listProgress.percent}%</span>
                      <span>
                        {listProgress.totalHave} / {listProgress.totalNeed} items
                      </span>
                      <div className="h-2 w-28 rounded-full bg-muted/70 overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${listProgress.percent}%` }}
                        />
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 text-muted-foreground transition-transform',
                        isExpanded ? 'rotate-180' : 'rotate-0'
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="mt-4 grid gap-6 lg:grid-cols-[140px_1fr]">
                      <div className="space-y-2 text-xs text-muted-foreground sticky top-24 self-start">
                        {getListSubcategories(list).map((subcategory) => (
                          <button
                            key={`${list.id}-${subcategory}-nav`}
                            onClick={() => {
                              const target = subcategoryRefs.current[list.id]?.[subcategory];
                              if (!target) return;
                              const top = target.getBoundingClientRect().top + window.scrollY - 120;
                              setActiveSubcategoryByList((prev) => ({ ...prev, [list.id]: subcategory }));
                              window.scrollTo({ top, behavior: 'smooth' });
                            }}
                            className={cn(
                              'w-full text-left rounded-full border px-3 py-1.5 transition-colors',
                              activeSubcategoryByList[list.id] === subcategory
                                ? 'border-primary/70 text-foreground'
                                : 'border-border/60 hover:border-primary/40'
                            )}
                          >
                            {subcategory}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-6">
                        {getListSubcategories(list).map((subcategory) => {
                          const itemsInGroup = visibleItems.filter((item) =>
                            getItemSubcategories(item).includes(subcategory)
                          );
                          if (itemsInGroup.length === 0) {
                            return null;
                          }
                          return (
                            <div
                              key={`${list.id}-${subcategory}`}
                              ref={(el) => {
                                if (!subcategoryRefs.current[list.id]) {
                                  subcategoryRefs.current[list.id] = {};
                                }
                                subcategoryRefs.current[list.id][subcategory] = el;
                              }}
                              data-subcategory={subcategory}
                            >
                              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                                {subcategory}
                              </div>
                              <div className="grid gap-y-3 gap-x-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-13">
                                {itemsInGroup.map((item) => {
                                  const progress = Math.round(getProgress(item) * 100);
                                  const isComplete = item.need > 0 && item.have >= item.need;
                                  return (
                                    <div
                                      key={`${list.id}-${item.id}-${subcategory}`}
                                      className={cn(
                                        'w-24 rounded-2xl border border-border bg-background/70 px-2 pb-2 pt-0 flex flex-col items-center gap-2',
                                        isComplete ? 'opacity-50' : 'opacity-100'
                                      )}
                                    >
                                      <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-border/60 bg-background/80 p-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                      </div>
                                      <div className="flex items-center justify-center gap-1 w-full">
                                        <button
                                          onClick={() =>
                                            updateItem(list.id, item.id, { have: clamp(item.have - 1, 0, item.need) })
                                          }
                                          className="h-8 w-8 rounded-full border-2 border-border text-sm font-semibold leading-none"
                                        >
                                          -
                                        </button>
                                        <div className="w-10 text-center text-xs font-semibold leading-none px-0">
                                          {item.have}/{item.need}
                                        </div>
                                        <button
                                          onClick={() =>
                                            updateItem(list.id, item.id, { have: clamp(item.have + 1, 0, item.need) })
                                          }
                                          className="h-8 w-8 rounded-full border-2 border-border text-sm font-semibold leading-none"
                                        >
                                          +
                                        </button>
                                      </div>
                                      <div className="flex items-center justify-between w-full">
                                        <div className="h-1.5 flex-1 rounded-full bg-muted/70 overflow-hidden">
                                          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="ml-2 text-[10px] text-muted-foreground">{progress}%</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {visibleItems.length === 0 && (
                          <div className="text-sm text-muted-foreground">No items to display.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </section>
        )}
      </div>

      {(newListOpen || addItemOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card/95 p-6 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">
                  {newListOpen ? 'Create New List' : 'Add Items'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {newListOpen
                    ? 'Give your list a name, optional category, and pre-populate it with items.'
                    : 'Search and add new items to your custom list.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setNewListOpen(false);
                  setAddItemOpen(false);
                }}
                className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-6 space-y-6 overflow-y-auto pr-2">
              {newListOpen && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold">List Name</label>
                    <input
                      value={newListName}
                      onChange={(event) => setNewListName(event.target.value)}
                      placeholder="Required"
                      className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Category</label>
                    <input
                      value={newListCategory}
                      onChange={(event) => setNewListCategory(event.target.value)}
                      placeholder="Optional"
                      className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Choose any label that helps you organise this list (optional).
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Subcategories</label>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        value={newSubcategoryName}
                        onChange={(event) => setNewSubcategoryName(event.target.value)}
                        placeholder="Add subcategory"
                        className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => {
                          const next = newSubcategoryName.trim();
                          if (!next) return;
                          setNewListSubcategories((prev) =>
                            prev.includes(next) ? prev : [...prev, next]
                          );
                          setNewSubcategoryName('');
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {newListSubcategories.map((subcategory) => (
                        <div
                          key={subcategory}
                          className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground"
                        >
                          {subcategory}
                          <button
                            onClick={() =>
                              setNewListSubcategories((prev) => prev.filter((item) => item !== subcategory))
                            }
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={`Remove ${subcategory}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {newListSubcategories.length === 0 && (
                        <div className="text-xs text-muted-foreground">Default: General</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="text-sm font-semibold">Selected Items</div>
                {newListItems.length === 0 ? (
                  <div className="mt-2 text-sm text-muted-foreground">
                    No items selected yet. Search below to add some.
                  </div>
                ) : (
                  <div className="mt-3 grid gap-3">
                    {newListItems.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border bg-muted/40 px-3 py-3 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/60 bg-background/80">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.rarity}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setNewListItems((prev) =>
                                  prev.map((entry) =>
                                    entry.id === item.id
                                      ? { ...entry, need: Math.max(1, entry.need - 1) }
                                      : entry
                                  )
                                )
                              }
                              className="h-6 w-6 rounded-full border border-border text-xs font-semibold"
                            >
                              -
                            </button>
                            <div className="w-6 text-center text-xs font-semibold">{item.need}</div>
                            <button
                              onClick={() =>
                                setNewListItems((prev) =>
                                  prev.map((entry) =>
                                    entry.id === item.id ? { ...entry, need: entry.need + 1 } : entry
                                  )
                                )
                              }
                              className="h-6 w-6 rounded-full border border-border text-xs font-semibold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">Subcategories</div>
                        <div className="flex flex-wrap gap-2">
                          {normalizeSubcategories(newListSubcategories).map((subcategory) => {
                            const selected = getItemSubcategories(item).includes(subcategory);
                            return (
                              <button
                                key={`${item.id}-${subcategory}`}
                                onClick={() => toggleNewItemSubcategory(item.id, subcategory)}
                                className={cn(
                                  'rounded-full border px-3 py-1 text-xs font-semibold',
                                  selected
                                    ? 'border-primary/70 bg-primary/10 text-primary'
                                    : 'border-border text-muted-foreground hover:text-foreground'
                                )}
                              >
                                {subcategory}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold">Add Items</div>
                <input
                  value={searchCatalog}
                  onChange={(event) => setSearchCatalog(event.target.value)}
                  placeholder="Search items..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <div className="text-xs text-muted-foreground">Hint: Type at least 2 characters to search.</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {catalogResults.map((item) => {
                    const selected = newListItems.some((selectedItem) => selectedItem.id === item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleCatalogItem(item)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors',
                          selected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-muted/40 hover:border-primary/60'
                        )}
                      >
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/60 bg-background/80">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.rarity}</div>
                        </div>
                      </button>
                    );
                  })}
                  {catalogResults.length === 0 && (
                    <div className="text-sm text-muted-foreground">No items found.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  resetNewListState();
                  setNewListOpen(false);
                  setAddItemOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              {newListOpen ? (
                <button
                  onClick={handleCreateList}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Create
                </button>
              ) : (
                <button
                  onClick={() => selectedList && handleAddItemsToList(selectedList.id)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Add Items
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {editListId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card/95 p-6 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">Edit List</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Rename the list and reorder subcategories. Drag rows to change order.
                </p>
              </div>
              <button
                onClick={() => setEditListId(null)}
                className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-6 space-y-6 overflow-y-auto pr-2">
              <div>
                <label className="text-sm font-semibold">List Name</label>
                <input
                  value={editListName}
                  onChange={(event) => setEditListName(event.target.value)}
                  className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Subcategories</label>
                <div className="mt-3 space-y-2">
                  {editSubcategories.map((subcategory, index) => (
                    <div
                      key={`${subcategory}-${index}`}
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (dragIndex === null || dragIndex === index) return;
                        setEditSubcategories((prev) => {
                          const next = [...prev];
                          const [moved] = next.splice(dragIndex, 1);
                          next.splice(index, 0, moved);
                          return next;
                        });
                        setDragIndex(null);
                      }}
                      className="flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2"
                    >
                      <span className="text-xs text-muted-foreground">Drag</span>
                      <input
                        value={subcategory}
                        onChange={(event) => {
                          const next = event.target.value;
                          setEditSubcategories((prev) =>
                            prev.map((item, idx) => (idx === index ? next : item))
                          );
                        }}
                        className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() =>
                          setEditSubcategories((prev) => prev.filter((_, idx) => idx !== index))
                        }
                        className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${subcategory}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={editSubcategoryName}
                    onChange={(event) => setEditSubcategoryName(event.target.value)}
                    placeholder="Add subcategory"
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => {
                      const next = editSubcategoryName.trim();
                      if (!next) return;
                      setEditSubcategories((prev) =>
                        prev.includes(next) ? prev : [...prev, next]
                      );
                      setEditSubcategoryName('');
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="text-sm font-semibold">Assign Items to Subcategories</div>
                {editListItems.length === 0 ? (
                  <div className="mt-2 text-sm text-muted-foreground">No items in this list.</div>
                ) : (
                  <div className="mt-3 space-y-3">
                    {editListItems.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border bg-muted/40 px-3 py-3 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/60 bg-background/80">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.rarity}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">Subcategories</div>
                        <div className="flex flex-wrap gap-2">
                          {normalizeSubcategories(editSubcategories).map((subcategory) => {
                            const selected = getItemSubcategories(item).includes(subcategory);
                            return (
                              <button
                                key={`${item.id}-${subcategory}`}
                                onClick={() => toggleEditItemSubcategory(item.id, subcategory)}
                                className={cn(
                                  'rounded-full border px-3 py-1 text-xs font-semibold',
                                  selected
                                    ? 'border-primary/70 bg-primary/10 text-primary'
                                    : 'border-border text-muted-foreground hover:text-foreground'
                                )}
                              >
                                {subcategory}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditListId(null)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditList}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 space-y-2">
          {toasts.map((toast) => (
            <div key={toast.id} className="rounded-xl border border-border bg-background/90 px-4 py-3 text-sm shadow-lg">
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
