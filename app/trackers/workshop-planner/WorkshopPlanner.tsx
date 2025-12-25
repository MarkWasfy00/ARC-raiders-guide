'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Hammer, Star, StarOff, Triangle, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkbenchPlannerData, WorkbenchLevelData } from './actions';

type TabView = 'requirements' | 'unlocks';

type WorkshopModule = {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  image: string;
  maxLevel: number;
  currentLevel: number;
  plannedLevel: number;
  levels: WorkbenchLevelData[];
};

const workbenchConfig: Record<string, { nameAr: string; image: string }> = {
  WORKBENCH: {
    nameAr: 'طاولة العمل',
    image: '/images/trackers/blueprint-bg.webp',
  },
  SCRAPPY: {
    nameAr: 'السكرابي',
    image: '/images/trackers/Scrappy.jpg',
  },
  GUNSMITH: {
    nameAr: 'صانع الأسلحة',
    image: '/images/trackers/Gunsmith.webp',
  },
  GEAR_BENCH: {
    nameAr: 'طاولة المعدات',
    image: '/images/trackers/GearBench.webp',
  },
  MEDICAL_LAB: {
    nameAr: 'المختبر الطبي',
    image: '/images/trackers/MedicalLab.webp',
  },
  EXPLOSIVES_STATION: {
    nameAr: 'محطة المتفجرات',
    image: '/images/trackers/ExplosivesStation.webp',
  },
  UTILITY_STATION: {
    nameAr: 'محطة الأدوات',
    image: '/images/trackers/UtilityStation.webp',
  },
  REFINER: {
    nameAr: 'المُصفّي',
    image: '/images/trackers/Refiner.webp',
  },
};

function WorkshopCard({ module }: { module: WorkshopModule }) {
  const [currentLevel, setCurrentLevel] = useState(module.currentLevel);
  const [plannedLevel, setPlannedLevel] = useState(module.plannedLevel);
  const [activeLevel, setActiveLevel] = useState(module.plannedLevel || 1);
  const [view, setView] = useState<TabView>('unlocks');

  // Persist state to localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`workshop-${module.slug}`);
    if (saved) {
      try {
        const { current, planned } = JSON.parse(saved);
        setCurrentLevel(current);
        setPlannedLevel(planned);
        setActiveLevel(planned || 1);
      } catch (e) {
        console.error('Failed to parse workshop state:', e);
      }
    }
  }, [module.slug]);

  useEffect(() => {
    localStorage.setItem(
      `workshop-${module.slug}`,
      JSON.stringify({ current: currentLevel, planned: plannedLevel })
    );
  }, [currentLevel, plannedLevel, module.slug]);

  const levelOptions = Array.from({ length: module.maxLevel }, (_, i) => i + 1);

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

  // Get the level data for the active level
  const activeLevelData = module.levels.find((lvl) => lvl.level === activeLevel);

  // Get items to display based on the active view
  const displayItems =
    view === 'requirements'
      ? activeLevelData?.requirements || []
      : activeLevelData?.crafts || [];

  return (
    <div className="group rounded-2xl bg-card/80 border border-border shadow-lg shadow-primary/5 overflow-hidden flex flex-col">
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={module.image}
          alt={module.nameAr}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-3 right-3 text-white">
          <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-sm font-semibold">
            <Wrench className="w-4 h-4" />
            <span>{module.nameAr}</span>
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-semibold rounded-full bg-primary text-primary-foreground px-3 py-1 shadow">
            المستوى {plannedLevel}/{module.maxLevel}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={handleDowngrade}
            disabled={currentLevel === 0}
            className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-full bg-muted/60 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Triangle className="w-4 h-4 rotate-90" />
            تخفيض
          </button>

          <div className="flex flex-1 items-center justify-center gap-3 rounded-full border border-border bg-muted/40 px-4 py-2 text-xs font-semibold sm:text-sm">
            <span className="text-muted-foreground">الحالي: {currentLevel}</span>
            <div className="h-5 w-px bg-border" />
            <span className="text-primary">المخطط: {plannedLevel}</span>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={currentLevel >= module.maxLevel}
            className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-full bg-primary/90 px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ترقية
            <Triangle className="w-4 h-4 -rotate-90" />
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-1">
          {(['unlocks', 'requirements'] as TabView[]).map((tab) => (
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
              {tab === 'unlocks' ? 'العناصر المتاحة' : 'المتطلبات'}
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
              م{level}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-background/70 p-4 shadow-inner">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                المستوى {activeLevel} {view === 'unlocks' ? '- العناصر المتاحة' : '- المتطلبات'}
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {displayItems.length > 0 ? (
              displayItems.map((displayItem, idx) => {
                const item = displayItem.item;
                const quantity = 'quantity' in displayItem ? (displayItem.quantity as number) : undefined;

                if (!item) {
                  // Item not found in database, show placeholder
                  return (
                    <div
                      key={`${displayItem.itemName}-${idx}`}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2"
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/60 bg-background/80 flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">?</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {displayItem.itemName}
                        </p>
                        {quantity !== undefined && (
                          <p className="text-xs text-muted-foreground">الكمية: {quantity}</p>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={`${item.id}-${idx}`}
                    href={`/items/${item.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 hover:bg-muted/60 transition-colors"
                  >
                    {item.icon && (
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/60 bg-background/80 flex-shrink-0">
                        <Image
                          src={item.icon}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {item.rarity && <span>{String(item.rarity)}</span>}
                        {quantity !== undefined && (
                          <>
                            <span>•</span>
                            <span className="font-semibold">الكمية: {quantity}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {view === 'requirements'
                  ? 'لا توجد متطلبات لهذا المستوى'
                  : 'لا توجد عناصر متاحة للصناعة في هذا المستوى'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkshopPlanner({
  workbenchData,
}: {
  workbenchData: WorkbenchPlannerData[];
}) {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('workshop-favorited');
    if (saved) {
      setFavorited(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('workshop-favorited', JSON.stringify(favorited));
  }, [favorited]);

  const workshopModules: WorkshopModule[] = workbenchData.map((data) => {
    const config = workbenchConfig[data.type] || {
      nameAr: data.name,
      image: 'https://cdn.metaforge.app/arc-raiders/guides/hideout.webp',
    };

    return {
      id: data.id,
      name: data.name,
      nameAr: config.nameAr,
      slug: data.type.toLowerCase(),
      image: config.image,
      maxLevel: data.levels.length,
      currentLevel: 0,
      plannedLevel: 1,
      levels: data.levels,
    };
  });

  return (
    <main className="min-h-screen">
      <div className="w-full px-4 md:px-8 lg:px-16 xl:px-24 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Hammer className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">مخطط الورشة</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                آرك رايدرز
              </Link>
              <span className="text-border">›</span>
              <Link
                href="/trackers/workshop-planner"
                className="text-foreground font-semibold"
              >
                الورشة
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
            {favorited ? (
              <Star className="w-4 h-4 fill-primary text-primary" />
            ) : (
              <StarOff className="w-4 h-4" />
            )}
            {favorited ? 'تمت الإضافة للمفضلة' : 'إضافة للمفضلة'}
          </button>
        </div>

        <div className="space-y-2">
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              هذه نظرة عامة على مستويات الورشة وطاولات العمل.
            </span>{' '}
            تتبع تقدمك في الورشة وخطط للترقية التالية. استخدم أزرار الترقية والتخفيض لتعيين مستوى طاولة العمل الحالية. يتم حفظ تقدمك تلقائياً في المتصفح.
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            انقر على علامة التبويب "العناصر المتاحة" لرؤية العناصر التي يمكنك صناعتها في كل مستوى، أو علامة التبويب "المتطلبات" لرؤية المواد التي تحتاجها للمستوى التالي.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {workshopModules.map((module) => (
            <WorkshopCard key={module.slug} module={module} />
          ))}
        </div>
      </div>
    </main>
  );
}
