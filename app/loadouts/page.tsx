'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Eye, EyeOff, Heart, HeartOff, Search, Trash2, X } from 'lucide-react';
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

type Weapon = {
  name: string;
  image: string;
  type: string;
};

type Loadout = {
  id: string;
  name: string;
  author: string;
  date: string;
  primary: Weapon;
  secondary: Weapon;
  augments: string;
  shield: string;
  tags: LoadoutTag[];
  description?: string;
  isMine?: boolean;
  isPublic?: boolean;
};

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

const LOADOUTS_STORAGE_KEY = 'arc-loadouts-state';

const FALLBACK_WEAPON: Weapon = {
  name: 'Select Weapon',
  image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-1.webp',
  type: 'Weapon',
};

const FALLBACK_SHIELD = 'https://cdn.metaforge.app/arc-raiders/items/shield-core.webp';
const FALLBACK_AUGMENT = 'https://cdn.metaforge.app/arc-raiders/items/augment-core.webp';

const normalizeStoredLoadout = (item: any): Loadout | null => {
  if (!item || typeof item !== 'object') return null;
  if (item.primary && item.secondary && item.augments && item.shield) {
    return item as Loadout;
  }
  if (item.build) {
    const primary = item.build.primary
      ? {
          name: item.build.primary.name,
          image: item.build.primary.image,
          type: item.build.primary.meta ?? 'Weapon',
        }
      : FALLBACK_WEAPON;
    const secondary = item.build.secondary
      ? {
          name: item.build.secondary.name,
          image: item.build.secondary.image,
          type: item.build.secondary.meta ?? 'Weapon',
        }
      : FALLBACK_WEAPON;
    return {
      id: item.id,
      name: item.name,
      author: item.author,
      date: item.date,
      primary,
      secondary,
      augments: FALLBACK_AUGMENT,
      shield: item.build.shield?.image ?? FALLBACK_SHIELD,
      tags: item.tags ?? [],
      description: item.description ?? '',
      isMine: item.isMine ?? false,
      isPublic: item.isPublic ?? true,
    };
  }
  return null;
};

const loadouts: Loadout[] = [
  {
    id: 'farm-solo',
    name: 'Farm Solo',
    author: 'EchoRunner',
    date: '2025-10-27',
    primary: {
      name: 'Manticore SMG',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-1.webp',
      type: 'SMG',
    },
    secondary: {
      name: 'Longbow DMR',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-2.webp',
      type: 'DMR',
    },
    augments: 'https://cdn.metaforge.app/arc-raiders/items/augment-core.webp',
    shield: 'https://cdn.metaforge.app/arc-raiders/items/shield-core.webp',
    tags: ['PvE', 'Solo', 'Mid Range'],
    description: 'Quiet farming loop for early tech drops.',
  },
  {
    id: 'city-rush-duo',
    name: 'City Rush Duo',
    author: 'NovaVex',
    date: '2025-10-24',
    primary: {
      name: 'Breaker Shotgun',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-3.webp',
      type: 'Shotgun',
    },
    secondary: {
      name: 'Rift SMG',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-4.webp',
      type: 'SMG',
    },
    augments: 'https://cdn.metaforge.app/arc-raiders/items/augment-core.webp',
    shield: 'https://cdn.metaforge.app/arc-raiders/items/shield-core.webp',
    tags: ['PvP', 'Duo', 'Close Range'],
  },
  {
    id: 'ridge-trio',
    name: 'Ridge Trio',
    author: 'AtlasCrew',
    date: '2025-10-18',
    primary: {
      name: 'Harrier AR',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-5.webp',
      type: 'Assault Rifle',
    },
    secondary: {
      name: 'Piercer Sniper',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-6.webp',
      type: 'Sniper',
    },
    augments: 'https://cdn.metaforge.app/arc-raiders/items/augment-core.webp',
    shield: 'https://cdn.metaforge.app/arc-raiders/items/shield-core.webp',
    tags: ['PvP', 'Trio', 'Long Range'],
    description: 'Anchors high ground with rotating overwatch.',
  },
  {
    id: 'ghost-pve',
    name: 'Ghost PvE',
    author: 'FluxShade',
    date: '2025-10-10',
    primary: {
      name: 'Volt AR',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-7.webp',
      type: 'Assault Rifle',
    },
    secondary: {
      name: 'Skyline Pistol',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-8.webp',
      type: 'Sidearm',
    },
    augments: 'https://cdn.metaforge.app/arc-raiders/items/augment-core.webp',
    shield: 'https://cdn.metaforge.app/arc-raiders/items/shield-core.webp',
    tags: ['PvE', 'Solo', 'Mid Range'],
    description: 'Energy-efficient clear build.',
  },
  {
    id: 'stormline-duo',
    name: 'Stormline Duo',
    author: 'KaelNorth',
    date: '2025-10-21',
    primary: {
      name: 'Ranger AR',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-11.webp',
      type: 'Assault Rifle',
    },
    secondary: {
      name: 'Havoc SMG',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-12.webp',
      type: 'SMG',
    },
    augments: 'https://cdn.metaforge.app/arc-raiders/items/augment-core.webp',
    shield: 'https://cdn.metaforge.app/arc-raiders/items/shield-core.webp',
    tags: ['PvP', 'Duo', 'Mid Range'],
    description: 'Aggressive rotations with quick resets.',
  },
  {
    id: 'quarry-trio',
    name: 'Quarry Trio',
    author: 'MiraForge',
    date: '2025-09-30',
    primary: {
      name: 'Sentinel LMG',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-13.webp',
      type: 'LMG',
    },
    secondary: {
      name: 'Breach Shotgun',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-14.webp',
      type: 'Shotgun',
    },
    augments: 'https://cdn.metaforge.app/arc-raiders/items/augment-core.webp',
    shield: 'https://cdn.metaforge.app/arc-raiders/items/shield-core.webp',
    tags: ['PvE', 'Trio', 'Close Range'],
  },
  {
    id: 'my-bunker',
    name: 'My Bunker Run',
    author: 'You',
    date: '2025-10-28',
    primary: {
      name: 'Pulse LMG',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-9.webp',
      type: 'LMG',
    },
    secondary: {
      name: 'Nova Pistol',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-10.webp',
      type: 'Sidearm',
    },
    augments: 'https://cdn.metaforge.app/arc-raiders/items/augment-core.webp',
    shield: 'https://cdn.metaforge.app/arc-raiders/items/shield-core.webp',
    tags: ['PvE', 'Solo', 'Close Range'],
    description: 'Personal bunker entry setup with heavy sustain.',
    isMine: true,
    isPublic: true,
  },
  {
    id: 'my-scout',
    name: 'My Scout Loop',
    author: 'You',
    date: '2025-10-05',
    primary: {
      name: 'Vector Carbine',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-15.webp',
      type: 'Carbine',
    },
    secondary: {
      name: 'Signal DMR',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-16.webp',
      type: 'DMR',
    },
    augments: 'https://cdn.metaforge.app/arc-raiders/items/augment-core.webp',
    shield: 'https://cdn.metaforge.app/arc-raiders/items/shield-core.webp',
    tags: ['PvE', 'Solo', 'Long Range'],
    description: 'Recon pathing with safe exits.',
    isMine: true,
    isPublic: false,
  },
  {
    id: 'my-urban',
    name: 'My Urban Clash',
    author: 'You',
    date: '2025-10-14',
    primary: {
      name: 'Raptor SMG',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-17.webp',
      type: 'SMG',
    },
    secondary: {
      name: 'Arc Pistol',
      image: 'https://cdn.metaforge.app/arc-raiders/weapons/arc-weapon-18.webp',
      type: 'Sidearm',
    },
    augments: 'https://cdn.metaforge.app/arc-raiders/items/augment-core.webp',
    shield: 'https://cdn.metaforge.app/arc-raiders/items/shield-core.webp',
    tags: ['PvP', 'Solo', 'Close Range'],
    description: 'Fast entry kit with quick disengage.',
    isMine: true,
    isPublic: true,
  },
];

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

export default function CommunityLoadoutsPage() {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<LoadoutTag[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [mode, setMode] = useState<'public' | 'mine'>('public');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loadoutData, setLoadoutData] = useState<Loadout[]>(loadouts);

  useEffect(() => {
    const stored = localStorage.getItem(LOADOUTS_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as any[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = parsed
          .map((item) => normalizeStoredLoadout(item))
          .filter((item): item is Loadout => Boolean(item));
        if (normalized.length === 0) return;
        setLoadoutData((prev) => {
          const merged = [...prev];
          normalized.forEach((item) => {
            if (!merged.find((existing) => existing.id === item.id)) {
              merged.push(item);
            }
          });
          return merged;
        });
      }
    } catch {
      // ignore storage failures
    }
  }, []);


  const filteredLoadouts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return loadoutData
      .filter((loadout) => {
        if (mode === 'mine' && !loadout.isMine) return false;
        if (query && !loadout.name.toLowerCase().includes(query)) return false;
        if (selectedTags.length > 0) {
          return selectedTags.every((tag) => loadout.tags.includes(tag));
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          const result = a.name.localeCompare(b.name, undefined, {
            sensitivity: 'base',
            numeric: true,
          });
          return sortDirection === 'asc' ? result : -result;
        }
        const aTime = new Date(a.date).getTime();
        const bTime = new Date(b.date).getTime();
        const result = (isNaN(aTime) ? 0 : aTime) - (isNaN(bTime) ? 0 : bTime);
        return sortDirection === 'asc' ? result : -result;
      });
  }, [mode, searchTerm, selectedTags, sortBy, sortDirection]);

  const toggleTag = (tag: LoadoutTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/loadouts/${id}`;
    void navigator.clipboard.writeText(url);
  };

  const toggleVisibility = (id: string) => {
    setLoadoutData((prev) =>
      prev.map((loadout) =>
        loadout.id === id
          ? { ...loadout, isPublic: !(loadout.isPublic ?? true) }
          : loadout
      )
    );
  };

  const deleteLoadout = (id: string) => {
    setLoadoutData((prev) => prev.filter((loadout) => loadout.id !== id));
    try {
      const stored = localStorage.getItem(LOADOUTS_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Loadout[];
      if (!Array.isArray(parsed)) return;
      const next = parsed.filter((loadout) => loadout.id !== id);
      localStorage.setItem(LOADOUTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
  };

  const handleSortByName = () => {
    if (sortBy === 'name') {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy('name');
    setSortDirection('asc');
  };

  const handleSortByDate = () => {
    if (sortBy === 'date') {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy('date');
    setSortDirection('desc');
  };

  return (
    <main className="min-h-screen scroll-smooth">
      <div className="relative w-full px-[100px] py-10 space-y-8">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/15 blur-[140px]" />
        <div className="pointer-events-none absolute top-24 left-10 h-56 w-56 rounded-full bg-secondary/20 blur-[120px]" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Community Loadouts</h1>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Arc Raiders &gt; Loadouts
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
            {favorited ? <Heart className="w-4 h-4 fill-primary text-primary" /> : <HeartOff className="w-4 h-4" />}
            {favorited ? 'Added to Favourite' : 'Add to Favourite'}
          </button>
        </div>

        <section className="rounded-2xl border border-border bg-background/70 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-[400px]">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search loadouts by name"
                className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <button
              type="button"
              onClick={() => setTagsOpen((prev) => !prev)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                tagsOpen
                  ? 'border-primary/70 bg-primary/10 text-primary'
                  : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
              )}
            >
              Tags
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold"
              >
                Search
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
                aria-label="Clear filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => router.push('/loadouts/create')}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Create Loadout
            </button>
          </div>
          {tagsOpen && (
            <div className="mt-3 flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                      active
                        ? 'border-primary/70 bg-primary/10 text-primary'
                        : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 gap-2 rounded-full border border-border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setMode('public')}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              mode === 'public'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Public Loadouts
          </button>
          <button
            type="button"
            onClick={() => setMode('mine')}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              mode === 'mine'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            My Loadouts
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sort
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSortByName}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                sortBy === 'name'
                  ? 'border-primary/70 bg-primary/10 text-primary'
                  : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
              )}
            >
              Sort by Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              type="button"
              onClick={handleSortByDate}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                sortBy === 'date'
                  ? 'border-primary/70 bg-primary/10 text-primary'
                  : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
              )}
            >
              Sort by Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLoadouts.map((loadout) => {
            const isPublic = loadout.isPublic ?? true;
            return (
            <div
              key={loadout.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/loadouts/${loadout.id}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  router.push(`/loadouts/${loadout.id}`);
                }
              }}
              className="group text-left rounded-2xl border border-border bg-card/80 p-4 transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-lg font-semibold">{loadout.name}</div>
                <div className="flex items-center gap-2">
                  {loadout.isMine && (
                    <div className="rounded-full border border-border p-2 text-muted-foreground">
                      {isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      copyLink(loadout.id);
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Copy share link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                by{' '}
                {loadout.isMine ? (
                  <span className="inline-flex items-center rounded-full border border-primary/60 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    You
                  </span>
                ) : (
                  <span className="text-foreground/80 font-semibold">{loadout.author}</span>
                )}{' '}
                <span className="ml-2">{formatDate(loadout.date)}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[loadout.primary, loadout.secondary].map((weapon, index) => (
                  <div key={`${loadout.id}-weapon-${index}`} className="relative group/weapon">
                    <div className="relative h-24 w-full overflow-hidden rounded-xl border border-border bg-background/80">
                      <Image src={weapon.image} alt={weapon.name} fill className="object-cover" />
                    </div>
                    <div className="pointer-events-none absolute left-2 right-2 top-full z-10 mt-2 rounded-xl border border-border bg-background/95 px-3 py-2 text-xs text-foreground opacity-0 shadow-lg transition-all group-hover/weapon:translate-y-1 group-hover/weapon:opacity-100">
                      <div className="font-semibold">{weapon.name}</div>
                      <div className="text-muted-foreground">{weapon.type}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border bg-background/80">
                  <Image src={loadout.augments} alt="Augments" fill className="object-cover" />
                </div>
                <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border bg-background/80">
                  <Image src={loadout.shield} alt="Compatible Shield" fill className="object-cover" />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {loadout.tags.slice(0, 5).map((tag) => (
                  <span
                    key={`${loadout.id}-${tag}`}
                    className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {loadout.description && (
                <div className="mt-3 text-xs text-muted-foreground">
                  {loadout.description}
                </div>
              )}
            </div>
          );
        })}
        </section>
      </div>
    </main>
  );
}
