'use client';

import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import { Search, Star, StarOff, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Tier = 'S' | 'A' | 'B' | 'C' | 'D';

type WeaponItem = {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  tier: Tier;
  rarity: string | null;
  value: number;
  stat_block: any;
};

const tiers: Tier[] = ['S', 'A', 'B', 'C', 'D'];

const tierColors: Record<Tier, { solid: string; soft: string }> = {
  S: { solid: 'bg-red-500', soft: 'bg-red-500/15' },
  A: { solid: 'bg-orange-500', soft: 'bg-orange-500/15' },
  B: { solid: 'bg-amber-500', soft: 'bg-amber-500/15' },
  C: { solid: 'bg-yellow-400', soft: 'bg-yellow-400/15' },
  D: { solid: 'bg-green-400', soft: 'bg-green-400/15' },
};

/**
 * Filter weapons to keep only base versions (without Roman numerals)
 * Example: For "Bettina", "Bettina I", "Bettina II", "Bettina III" -> keep only "Bettina"
 */
function filterBaseWeapons(weapons: WeaponItem[]): WeaponItem[] {
  const weaponGroups = new Map<string, WeaponItem[]>();

  // Group weapons by their base name
  weapons.forEach((weapon) => {
    // Match Roman numerals at the end: I, II, III, IV, V, VI, VII, VIII, IX, X, etc.
    const romanNumeralPattern = /\s+(I{1,3}|IV|V|VI{0,3}|IX|X)$/i;
    const baseName = weapon.name.replace(romanNumeralPattern, '').trim();

    if (!weaponGroups.has(baseName)) {
      weaponGroups.set(baseName, []);
    }
    weaponGroups.get(baseName)!.push(weapon);
  });

  // For each group, prefer the weapon without Roman numerals
  const filteredWeapons: WeaponItem[] = [];
  weaponGroups.forEach((group, baseName) => {
    // Try to find the exact base name (without Roman numerals)
    const baseWeapon = group.find((w) => w.name.trim() === baseName);

    if (baseWeapon) {
      filteredWeapons.push(baseWeapon);
    } else {
      // If no exact base name, take the first one (lowest level)
      filteredWeapons.push(group[0]);
    }
  });

  return filteredWeapons;
}

// Sortable Item Component
function SortableWeaponItem({ weapon }: { weapon: WeaponItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: weapon.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-background/70 p-2 transition-all',
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab hover:-translate-y-1'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="absolute top-1 left-1 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden border border-border/60 bg-background">
        {weapon.icon ? (
          <Image src={weapon.icon} alt={weapon.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground line-clamp-2">{weapon.name}</p>
        {weapon.rarity && (
          <p className="text-[11px] text-muted-foreground">{weapon.rarity}</p>
        )}
      </div>

      {/* Hover Tooltip */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-20 w-56 -translate-x-1/2 -translate-y-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="rounded-xl border border-border bg-card/95 p-3 shadow-xl">
          <div className="relative h-24 w-full overflow-hidden rounded-lg border border-border/60">
            {weapon.icon ? (
              <Image src={weapon.icon} alt={weapon.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <h4 className="mt-3 text-sm font-semibold text-foreground">{weapon.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-3">{weapon.description}</p>
          {weapon.rarity && (
            <div className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
              {weapon.rarity}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Droppable Tier Component
function DroppableTier({
  tier,
  weapons,
}: {
  tier: Tier;
  weapons: WeaponItem[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `tier-${tier}`,
    data: { tier },
  });

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-0">
      <div
        className={cn(
          'w-full lg:w-[200px] lg:shrink-0 flex items-center justify-center text-3xl font-bold text-white',
          'rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none py-6 lg:py-0',
          tierColors[tier].solid
        )}
      >
        {tier}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-b-xl lg:rounded-r-xl lg:rounded-bl-none border border-border/60',
          'p-4 sm:p-5 min-h-[150px] transition-colors',
          tierColors[tier].soft,
          isOver && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        {weapons.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            اسحب الأسلحة هنا لإضافتها إلى هذه الفئة
          </div>
        ) : (
          <SortableContext items={weapons.map(w => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 gap-3">
              {weapons.map((weapon) => (
                <SortableWeaponItem key={weapon.id} weapon={weapon} />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </section>
  );
}

export default function WeaponsTierListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [weapons, setWeapons] = useState<WeaponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch weapons from API
  useEffect(() => {
    async function fetchWeapons() {
      try {
        setLoading(true);
        const response = await fetch('/api/items?type=WEAPON&pageSize=1000');
        const result = await response.json();

        if (result.success) {
          // Initialize all weapons in tier D by default
          const weaponsData = result.data.map((item: any) => ({
            ...item,
            tier: 'D' as Tier,
          }));

          // Filter to keep only base weapons (without Roman numerals)
          const baseWeapons = filterBaseWeapons(weaponsData);
          setWeapons(baseWeapons);
        }
      } catch (error) {
        console.error('Error fetching weapons:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeapons();
  }, []);

  // Filter weapons by search query
  const filteredWeapons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return weapons;
    return weapons.filter((weapon) =>
      weapon.name.toLowerCase().includes(query)
    );
  }, [weapons, searchQuery]);

  // Group weapons by tier
  const weaponsByTier = useMemo(
    () =>
      tiers.reduce<Record<Tier, WeaponItem[]>>((acc, tier) => {
        acc[tier] = filteredWeapons.filter((weapon) => weapon.tier === tier);
        return acc;
      }, {} as Record<Tier, WeaponItem[]>),
    [filteredWeapons]
  );

  // Get the tier that contains a specific weapon
  const findTierByWeaponId = (id: string): Tier | null => {
    const weapon = weapons.find(w => w.id === id);
    return weapon ? weapon.tier : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're over a tier container
    if (overId.startsWith('tier-')) {
      const newTier = over.data.current?.tier as Tier;
      if (newTier) {
        setWeapons((weapons) =>
          weapons.map((weapon) =>
            weapon.id === activeId ? { ...weapon, tier: newTier } : weapon
          )
        );
      }
      return;
    }

    // Find which tiers these weapons belong to
    const activeTier = findTierByWeaponId(activeId);
    const overTier = findTierByWeaponId(overId);

    if (!activeTier || !overTier) return;

    if (activeTier !== overTier) {
      // Moving between different tiers
      setWeapons((weapons) =>
        weapons.map((weapon) =>
          weapon.id === activeId ? { ...weapon, tier: overTier } : weapon
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropped on a tier container, the tier is already set in handleDragOver
    if (overId.startsWith('tier-')) {
      return;
    }

    if (activeId === overId) return;

    // Find which tier these weapons belong to (after potential tier change)
    const activeTier = findTierByWeaponId(activeId);
    const overTier = findTierByWeaponId(overId);

    if (!activeTier || !overTier || activeTier !== overTier) return;

    const tierWeapons = weaponsByTier[activeTier];
    const oldIndex = tierWeapons.findIndex((w) => w.id === activeId);
    const newIndex = tierWeapons.findIndex((w) => w.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newTierWeapons = arrayMove(tierWeapons, oldIndex, newIndex);

      // Update the weapons array while maintaining the order within the tier
      setWeapons((weapons) => {
        const otherWeapons = weapons.filter((w) => w.tier !== activeTier);
        return [...otherWeapons, ...newTierWeapons];
      });
    }
  };

  // Get active weapon for drag overlay
  const activeWeapon = activeId ? weapons.find((w) => w.id === activeId) : null;

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="w-full px-4 md:px-8 lg:px-[100px] py-8">
          <div className="text-center text-muted-foreground">جاري التحميل...</div>
        </div>
      </main>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <main className="min-h-screen">
        <div className="w-full px-4 md:px-8 lg:px-[100px] py-8 space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">قائمة تصنيف الأسلحة</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground border border-dashed border-border/70 rounded-full px-3 py-1 bg-muted/40">
                <span>آرك رايدرز</span>
                <span className="text-border">•</span>
                <span className="text-foreground font-semibold">تصنيف الأسلحة</span>
              </div>
            </div>
            <button
              onClick={() => setFavorited((prev) => !prev)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors shadow-sm',
                favorited
                  ? 'border-primary/70 bg-primary/10 text-primary'
                  : 'border-border bg-muted/40 text-foreground'
              )}
            >
              {favorited ? <Star className="w-4 h-4 fill-primary text-primary" /> : <StarOff className="w-4 h-4" />}
              {favorited ? 'تمت الإضافة إلى المفضلة' : 'أضف إلى المفضلة'}
            </button>
          </div>

          {/* Description */}
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            صنف أسلحتك المفضلة! اسحب وأفلت الأسلحة لتنظيمها حسب تفضيلاتك. التصنيفات محلية ولن يتم حفظها في قاعدة البيانات.
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-3 shadow-sm">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن سلاح بالاسم..."
              className="w-full bg-transparent focus:outline-none text-sm md:text-base placeholder:text-muted-foreground/70"
            />
          </div>

          {/* Tier List */}
          <div className="space-y-6">
            {tiers.map((tier) => (
              <DroppableTier key={tier} tier={tier} weapons={weaponsByTier[tier]} />
            ))}
          </div>
        </div>
      </main>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeWeapon ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-primary bg-background/90 p-2 shadow-xl cursor-grabbing">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border/60 bg-background">
              {activeWeapon.icon ? (
                <Image src={activeWeapon.icon} alt={activeWeapon.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  No Image
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-foreground">{activeWeapon.name}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
