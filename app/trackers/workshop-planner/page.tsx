'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Hammer,
  Star,
  StarOff,
  Triangle,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Requirement = {
  name: string;
  quantity: string;
  icon: string;
};

type ModuleLevel = {
  level: number;
  requirements: Requirement[];
  unlocks: Requirement[];
};

type WorkshopModule = {
  name: string;
  slug: string;
  image: string;
  maxLevel: number;
  currentLevel: number;
  plannedLevel: number;
  levels: ModuleLevel[];
};

const workshopModules: WorkshopModule[] = [
  {
    name: 'Scrappy',
    slug: 'scrappy',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/hideout.webp',
    maxLevel: 6,
    currentLevel: 1,
    plannedLevel: 2,
    levels: [
      {
        level: 1,
        requirements: [
          { name: 'Steel Plate', quantity: '6x', icon: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp' },
          { name: 'Circuit Board', quantity: '3x', icon: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp' },
        ],
        unlocks: [
          { name: 'Basic Ammo Box', quantity: '3x', icon: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp' },
          { name: 'Bandage', quantity: '5x', icon: 'https://cdn.metaforge.app/arc-raiders/items/bandage.webp' },
        ],
      },
      {
        level: 2,
        requirements: [
          { name: 'Arc Alloy', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp' },
          { name: 'Energy Cell', quantity: '8x', icon: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp' },
        ],
        unlocks: [
          { name: 'Weapon Blueprint: Striker', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/arcs/skirmisher.webp' },
          { name: 'Adrenaline Shot', quantity: '4x', icon: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp' },
        ],
      },
      {
        level: 3,
        requirements: [
          { name: 'Nano Fiber', quantity: '4x', icon: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp' },
          { name: 'Plasma Core', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp' },
        ],
        unlocks: [
          { name: 'Suppressor', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp' },
          { name: 'Med Kit', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp' },
        ],
      },
      {
        level: 4,
        requirements: [
          { name: 'Plasma Core', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp' },
          { name: 'Arc Alloy', quantity: '4x', icon: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp' },
        ],
        unlocks: [
          { name: 'Advanced Ammo Box', quantity: '5x', icon: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp' },
          { name: 'Stabilized Core Frame', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp' },
        ],
      },
    ],
  },
  {
    name: 'Gunsmith',
    slug: 'gunsmith',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/weapons.webp',
    maxLevel: 6,
    currentLevel: 0,
    plannedLevel: 1,
    levels: [
      {
        level: 1,
        requirements: [
          { name: 'Circuit Board', quantity: '5x', icon: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp' },
          { name: 'Steel Plate', quantity: '8x', icon: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp' },
        ],
        unlocks: [
          { name: 'Common Attachments', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp' },
          { name: 'Ammo Box', quantity: '4x', icon: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp' },
        ],
      },
      {
        level: 2,
        requirements: [
          { name: 'Arc Alloy', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp' },
          { name: 'Energy Cell', quantity: '6x', icon: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp' },
        ],
        unlocks: [
          { name: 'Rare Attachments', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp' },
          { name: 'Upgraded Ammo Box', quantity: '3x', icon: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp' },
        ],
      },
      {
        level: 3,
        requirements: [
          { name: 'Nano Fiber', quantity: '3x', icon: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp' },
          { name: 'Plasma Core', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp' },
        ],
        unlocks: [
          { name: 'Precision Barrel', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp' },
          { name: 'Recoil Dampener', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp' },
        ],
      },
      {
        level: 4,
        requirements: [
          { name: 'Plasma Core', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp' },
          { name: 'Arc Alloy', quantity: '4x', icon: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp' },
        ],
        unlocks: [
          { name: 'Legendary Attachment Token', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp' },
          { name: 'Weapon Blueprint Cache', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/arcs/sentry.webp' },
        ],
      },
    ],
  },
  {
    name: 'Fabricator',
    slug: 'fabricator',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/loot.webp',
    maxLevel: 6,
    currentLevel: 2,
    plannedLevel: 3,
    levels: [
      {
        level: 1,
        requirements: [
          { name: 'Steel Plate', quantity: '5x', icon: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp' },
          { name: 'Bandage', quantity: '6x', icon: 'https://cdn.metaforge.app/arc-raiders/items/bandage.webp' },
        ],
        unlocks: [
          { name: 'Basic Med Kit', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp' },
          { name: 'Adrenaline Shot', quantity: '3x', icon: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp' },
        ],
      },
      {
        level: 2,
        requirements: [
          { name: 'Circuit Board', quantity: '4x', icon: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp' },
          { name: 'Arc Alloy', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp' },
        ],
        unlocks: [
          { name: 'Stimulant Kit', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp' },
          { name: 'Armor Patch', quantity: '4x', icon: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp' },
        ],
      },
      {
        level: 3,
        requirements: [
          { name: 'Nano Fiber', quantity: '3x', icon: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp' },
          { name: 'Energy Cell', quantity: '10x', icon: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp' },
        ],
        unlocks: [
          { name: 'Improved Med Kit', quantity: '3x', icon: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp' },
          { name: 'Combat Stims', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp' },
        ],
      },
      {
        level: 4,
        requirements: [
          { name: 'Plasma Core', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp' },
          { name: 'Nano Fiber', quantity: '4x', icon: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp' },
        ],
        unlocks: [
          { name: 'Advanced Med Crate', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp' },
          { name: 'Stim Injector Mk II', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp' },
        ],
      },
    ],
  },
  {
    name: 'Fabricator Copy',
    slug: 'fabricator-copy',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/loot.webp',
    maxLevel: 6,
    currentLevel: 2,
    plannedLevel: 3,
    levels: [
      {
        level: 1,
        requirements: [
          { name: 'Steel Plate', quantity: '5x', icon: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp' },
          { name: 'Bandage', quantity: '6x', icon: 'https://cdn.metaforge.app/arc-raiders/items/bandage.webp' },
        ],
        unlocks: [
          { name: 'Basic Med Kit', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp' },
          { name: 'Adrenaline Shot', quantity: '3x', icon: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp' },
        ],
      },
      {
        level: 2,
        requirements: [
          { name: 'Circuit Board', quantity: '4x', icon: 'https://cdn.metaforge.app/arc-raiders/items/circuit-board.webp' },
          { name: 'Arc Alloy', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/arc-alloy.webp' },
        ],
        unlocks: [
          { name: 'Stimulant Kit', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp' },
          { name: 'Armor Patch', quantity: '4x', icon: 'https://cdn.metaforge.app/arc-raiders/items/steel-plate.webp' },
        ],
      },
      {
        level: 3,
        requirements: [
          { name: 'Nano Fiber', quantity: '3x', icon: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp' },
          { name: 'Energy Cell', quantity: '10x', icon: 'https://cdn.metaforge.app/arc-raiders/items/energy-cell.webp' },
        ],
        unlocks: [
          { name: 'Improved Med Kit', quantity: '3x', icon: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp' },
          { name: 'Combat Stims', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp' },
        ],
      },
      {
        level: 4,
        requirements: [
          { name: 'Plasma Core', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/items/plasma-core.webp' },
          { name: 'Nano Fiber', quantity: '4x', icon: 'https://cdn.metaforge.app/arc-raiders/items/nano-fiber.webp' },
        ],
        unlocks: [
          { name: 'Advanced Med Crate', quantity: '1x', icon: 'https://cdn.metaforge.app/arc-raiders/items/medical-supplies.webp' },
          { name: 'Stim Injector Mk II', quantity: '2x', icon: 'https://cdn.metaforge.app/arc-raiders/items/adrenaline-shot.webp' },
        ],
      },
    ],
  },
];

type TabView = 'requirements' | 'unlocks';

function WorkshopCard({ module }: { module: WorkshopModule }) {
  const [currentLevel, setCurrentLevel] = useState(module.currentLevel);
  const [plannedLevel, setPlannedLevel] = useState(module.plannedLevel);
  const [activeLevel, setActiveLevel] = useState(module.plannedLevel);
  const [view, setView] = useState<TabView>('requirements');

  const levelOptions = [1, 2, 3, 4].filter((level) => level <= module.maxLevel);

  const levelData = module.levels.find((lvl) => lvl.level === activeLevel);

  const handleUpgrade = () => {
    setCurrentLevel((prev) => {
      const next = Math.min(module.maxLevel, prev + 1);
      setPlannedLevel((planned) => Math.max(planned, next));
      setActiveLevel((lvl) => Math.max(lvl, next));
      return next;
    });
  };

  const handleDowngrade = () => {
    setCurrentLevel((prev) => {
      const next = Math.max(0, prev - 1);
      setPlannedLevel((planned) => Math.max(planned, next));
      setActiveLevel((lvl) => Math.max(lvl, Math.max(1, next)));
      return next;
    });
  };

  const handleSelectLevel = (level: number) => {
    setPlannedLevel(level);
    setActiveLevel(level);
  };

  const handleTabChange = (nextView: TabView) => {
    setView(nextView);
  };

  return (
    <div className="group rounded-2xl bg-card/80 border border-border shadow-lg shadow-primary/5 overflow-hidden flex flex-col">
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={module.image}
          alt={module.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white">
          <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-sm font-semibold">
            <Wrench className="w-4 h-4" />
            <span>{module.name}</span>
          </div>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="text-xs font-semibold rounded-full bg-primary text-primary-foreground px-3 py-1 shadow">
            Level {plannedLevel}/{module.maxLevel}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-nowrap items-center gap-1.5">
          <button
            onClick={handleDowngrade}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Triangle className="w-4 h-4 -rotate-90" />
            Downgrade
          </button>

          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap">
            <span className="text-muted-foreground">Current: {currentLevel}</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-primary">Planned: {plannedLevel}</span>
          </div>

          <button
            onClick={handleUpgrade}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary/90 px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary transition-colors"
          >
            Upgrade
            <Triangle className="w-4 h-4 rotate-90" />
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-1">
          {(['requirements', 'unlocks'] as TabView[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                'flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-all',
                tab === view
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab === 'requirements' ? 'Requirements' : 'Unlocked Crafts'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {levelOptions.map((level) => (
            <button
              key={level}
              onClick={() => handleSelectLevel(level)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors',
                activeLevel === level
                  ? 'border-primary/70 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/60'
              )}
            >
              Lv{level}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-background/70 p-4 shadow-inner">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Level {activeLevel}{' '}
                {view === 'requirements' ? 'Requirements' : 'Unlocks'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {levelData ? (
              (view === 'requirements' ? levelData.requirements : levelData.unlocks).map((item) => (
                <div
                  key={`${item.name}-${item.quantity}`}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/60 bg-background/80">
                    <Image
                      src={item.icon}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  </div>
                  <div className="text-sm font-bold text-primary">{item.quantity}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No data available for this level yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkshopPlannerPage() {
  const [favorited, setFavorited] = useState(false);

  return (
    <main className="min-h-screen">
      <div className="w-full px-[100px] py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Hammer className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Workshop Planner</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Arc Raiders
              </Link>
              <span className="text-border">›</span>
              <Link href="/trackers/workshop-planner" className="text-foreground font-semibold">
                Workshop
              </Link>
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
            {favorited ? 'Added to favourites' : 'Add to favourites'}
          </button>
        </div>

        <div className="space-y-2">
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">This is an overview of Workshop and Workbench Levels.</span>{' '}
            To track items, you can use the Workshop list in the{' '}
            <Link href="/needed-items" className="text-primary hover:underline">
              Needed Items
            </Link>{' '}
            tracker.
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Track your workshop progress and plan your next upgrade. Use the Upgrade and Downgrade buttons to set your current workbench level. Your progress is automatically saved in your browser. Click the Requirements tab to see what materials you need for the next level, or the Unlocked Crafts tab to see what items you can make at each level.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {workshopModules.map((module) => (
            <WorkshopCard key={module.slug} module={module} />
          ))}
        </div>
      </div>
    </main>
  );
}
