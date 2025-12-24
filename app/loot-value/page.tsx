'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search, Star, StarOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tier = 'S' | 'A' | 'B' | 'C' | 'D';
type SortKey = 'sell' | 'perKg' | 'recycle';

type LootItem = {
  id: string;
  name: string;
  description: string;
  image: string;
  tier: Tier;
  sellPrice: number;
  recycleValue: number;
  weight: number;
  stackSize: number;
  classification: string;
  size: number;
  sizeClass: string;
  rarity: string;
  isWeapon: boolean;
};

const lootItems: LootItem[] = [
  {
    id: 'loot-01',
    name: 'Quantum Coil',
    description: 'High-density coil used in advanced rail systems.',
    image: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp',
    tier: 'S',
    sellPrice: 5200,
    recycleValue: 180,
    weight: 6.5,
    stackSize: 1,
    classification: 'Recyclable',
    size: 4,
    sizeClass: 'Security',
    rarity: 'Legendary',
    isWeapon: false,
  },
  {
    id: 'loot-02',
    name: 'Arc Alloy Core',
    description: 'Stable alloy core used in reinforced modules.',
    image: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp',
    tier: 'S',
    sellPrice: 4700,
    recycleValue: 150,
    weight: 5.2,
    stackSize: 1,
    classification: 'Recyclable',
    size: 3,
    sizeClass: 'Industrial',
    rarity: 'Epic',
    isWeapon: false,
  },
  {
    id: 'loot-03',
    name: 'Rare Weapon Cache',
    description: 'Sealed cache with high-grade attachments.',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/sentry.webp',
    tier: 'A',
    sellPrice: 3200,
    recycleValue: 110,
    weight: 7.8,
    stackSize: 1,
    classification: 'Container',
    size: 5,
    sizeClass: 'Security',
    rarity: 'Rare',
    isWeapon: true,
  },
  {
    id: 'loot-04',
    name: 'Precision Barrel',
    description: 'Weapon barrel with tuned recoil handling.',
    image: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp',
    tier: 'A',
    sellPrice: 2800,
    recycleValue: 90,
    weight: 4.6,
    stackSize: 1,
    classification: 'Component',
    size: 3,
    sizeClass: 'Security',
    rarity: 'Rare',
    isWeapon: true,
  },
  {
    id: 'loot-05',
    name: 'Nano Fiber',
    description: 'Lightweight fiber for high-end fabrication.',
    image: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp',
    tier: 'A',
    sellPrice: 2400,
    recycleValue: 85,
    weight: 3.2,
    stackSize: 4,
    classification: 'Material',
    size: 2,
    sizeClass: 'Industrial',
    rarity: 'Uncommon',
    isWeapon: false,
  },
  {
    id: 'loot-06',
    name: 'Circuit Board',
    description: 'Standard circuitry for modular upgrades.',
    image: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp',
    tier: 'B',
    sellPrice: 1600,
    recycleValue: 60,
    weight: 2.4,
    stackSize: 6,
    classification: 'Material',
    size: 2,
    sizeClass: 'Civilian',
    rarity: 'Uncommon',
    isWeapon: false,
  },
  {
    id: 'loot-07',
    name: 'Stabilized Core Frame',
    description: 'Mid-grade frame used in ARC repairs.',
    image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
    tier: 'B',
    sellPrice: 1400,
    recycleValue: 48,
    weight: 5.1,
    stackSize: 2,
    classification: 'Component',
    size: 3,
    sizeClass: 'Industrial',
    rarity: 'Uncommon',
    isWeapon: false,
  },
  {
    id: 'loot-08',
    name: 'Combat Stims',
    description: 'Boosts performance during extended raids.',
    image: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp',
    tier: 'B',
    sellPrice: 1200,
    recycleValue: 42,
    weight: 1.1,
    stackSize: 3,
    classification: 'Consumable',
    size: 1,
    sizeClass: 'Medical',
    rarity: 'Common',
    isWeapon: false,
  },
  {
    id: 'loot-09',
    name: 'Energy Cell',
    description: 'Reliable power cell used across stations.',
    image: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp',
    tier: 'C',
    sellPrice: 900,
    recycleValue: 32,
    weight: 1.6,
    stackSize: 8,
    classification: 'Material',
    size: 1,
    sizeClass: 'Civilian',
    rarity: 'Common',
    isWeapon: false,
  },
  {
    id: 'loot-10',
    name: 'Armor Patch',
    description: 'Quick repair patch for gear upkeep.',
    image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
    tier: 'C',
    sellPrice: 780,
    recycleValue: 28,
    weight: 2.2,
    stackSize: 5,
    classification: 'Consumable',
    size: 1,
    sizeClass: 'Civilian',
    rarity: 'Common',
    isWeapon: false,
  },
  {
    id: 'loot-11',
    name: 'Bandage Roll',
    description: 'Basic healing supplies for field kits.',
    image: 'https://cdn.metaforge.app/arc-raiders/items/bandage.webp',
    tier: 'D',
    sellPrice: 320,
    recycleValue: 12,
    weight: 0.8,
    stackSize: 10,
    classification: 'Consumable',
    size: 1,
    sizeClass: 'Medical',
    rarity: 'Common',
    isWeapon: false,
  },
  {
    id: 'loot-12',
    name: 'Scrap Metal',
    description: 'Low-value scrap pulled from broken rigs.',
    image: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp',
    tier: 'D',
    sellPrice: 250,
    recycleValue: 8,
    weight: 3.5,
    stackSize: 12,
    classification: 'Material',
    size: 2,
    sizeClass: 'Industrial',
    rarity: 'Common',
    isWeapon: false,
  },
];

const tiers: Tier[] = ['S', 'A', 'B', 'C', 'D'];

const tierColors: Record<Tier, { solid: string; soft: string }> = {
  S: { solid: 'bg-red-500', soft: 'bg-red-500/15' },
  A: { solid: 'bg-orange-500', soft: 'bg-orange-500/15' },
  B: { solid: 'bg-amber-500', soft: 'bg-amber-500/15' },
  C: { solid: 'bg-yellow-400', soft: 'bg-yellow-400/15' },
  D: { solid: 'bg-green-400', soft: 'bg-green-400/15' },
};

export default function LootValueTiersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('sell');
  const [includeWeapons, setIncludeWeapons] = useState(true);
  const [favorited, setFavorited] = useState(false);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return lootItems
      .filter((item) => (includeWeapons ? true : !item.isWeapon))
      .filter((item) => (query.length ? item.name.toLowerCase().includes(query) : true))
      .sort((a, b) => {
        const aValue =
          sortKey === 'sell'
            ? a.sellPrice
            : sortKey === 'recycle'
              ? a.recycleValue
              : a.sellPrice / a.weight;
        const bValue =
          sortKey === 'sell'
            ? b.sellPrice
            : sortKey === 'recycle'
              ? b.recycleValue
              : b.sellPrice / b.weight;
        return bValue - aValue;
      });
  }, [includeWeapons, searchQuery, sortKey]);

  const itemsByTier = useMemo(
    () =>
      tiers.reduce<Record<Tier, LootItem[]>>((acc, tier) => {
        acc[tier] = filteredItems.filter((item) => item.tier === tier);
        return acc;
      }, {} as Record<Tier, LootItem[]>),
    [filteredItems]
  );

  return (
    <main className="min-h-screen">
      <div className="w-full px-[100px] py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Loot Value Tiers</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground border border-dashed border-border/70 rounded-full px-3 py-1 bg-muted/40">
              <span>Arc Raiders</span>
              <span className="text-border">ƒ?§</span>
              <span className="text-foreground font-semibold">Loot Value Tiers</span>
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
            {favorited ? 'Added to favourite' : 'Add to favourite'}
          </button>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Know what to pick up! Quickly find the best loot in ARC Raiders by their sell value, value per weight or
          recycle value.
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-3 shadow-sm flex-1">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search loot by name..."
              className="w-full bg-transparent focus:outline-none text-sm md:text-base placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {([
              { key: 'sell', label: 'Sell Price' },
              { key: 'perKg', label: 'Price per Kg' },
              { key: 'recycle', label: 'Recycle Value' },
            ] as { key: SortKey; label: string }[]).map((option) => (
              <button
                key={option.key}
                onClick={() => setSortKey(option.key)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  sortKey === option.key
                    ? 'border-primary/70 bg-primary/10 text-primary'
                    : 'border-border bg-muted/40 text-foreground'
                )}
              >
                {option.label}
              </button>
            ))}

            <button
              onClick={() => setIncludeWeapons((prev) => !prev)}
              className={cn(
                'inline-flex items-center gap-3 rounded-full border px-3 py-2 text-sm font-semibold transition-colors',
                includeWeapons ? 'border-primary/70 bg-primary/10 text-primary' : 'border-border bg-muted/40'
              )}
            >
              <span>Weapons</span>
              <span
                className={cn(
                  'relative inline-flex h-5 w-10 rounded-full transition-colors',
                  includeWeapons ? 'bg-primary/80' : 'bg-muted-foreground/40'
                )}
              >
                <span
                  className={cn(
                    'absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition-transform',
                    includeWeapons ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {tiers.map((tier) => {
            const items = itemsByTier[tier];
            return (
              <section key={tier} className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-0">
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
                  className={cn(
                    'flex-1 rounded-b-xl lg:rounded-r-xl lg:rounded-bl-none border border-border/60',
                    'p-4 sm:p-5',
                    tierColors[tier].soft
                  )}
                >
                  {items.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No items match this tier yet.</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 gap-3">
                      {items.map((item) => (
                        <Link
                          key={item.id}
                          href={`/items/${item.id}`}
                          className="group relative flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-background/70 p-2 transition-transform hover:-translate-y-1"
                        >
                          <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden border border-border/60 bg-background">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-semibold text-foreground line-clamp-2">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground">Recycle {item.recycleValue}</p>
                          </div>

                          <div className="pointer-events-none absolute left-1/2 top-0 z-20 w-56 -translate-x-1/2 -translate-y-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <div className="rounded-xl border border-border bg-card/95 p-3 shadow-xl">
                              <div className="relative h-24 w-full overflow-hidden rounded-lg border border-border/60">
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                              </div>
                              <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                                {item.classification} · {item.rarity}
                              </div>
                              <h4 className="mt-1 text-sm font-semibold text-foreground">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center justify-between">
                                  <span>Stack size</span>
                                  <span className="text-foreground">
                                    {item.stackSize} · {item.size} {item.sizeClass}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Weight</span>
                                  <span className="text-foreground">
                                    {item.weight}kg · {item.recycleValue} recycle
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
