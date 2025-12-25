'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import {
  BadgeCheck,
  Search,
  Star,
  StarOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlueprints, type Blueprint as DbBlueprint } from './actions';

type BlueprintStatus = 'needed' | 'obtained';

type Blueprint = DbBlueprint & {
  status: BlueprintStatus;
  duplicate?: boolean;
};

type Tab = 'needed' | 'obtained' | 'duplicates';

const STORAGE_KEY = 'arc-blueprint-tracker';

export default function BlueprintTracker() {
  const [tab, setTab] = useState<Tab>('needed');
  const [searchQuery, setSearchQuery] = useState('');
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  const totalBlueprints = blueprints.length;
  const obtainedCount = blueprints.filter((bp) => bp.status === 'obtained').length;
  const duplicateCount = blueprints.filter((bp) => bp.status === 'obtained' && bp.duplicate).length;
  const neededCount = blueprints.filter((bp) => bp.status === 'needed').length;
  const progressPercent = totalBlueprints === 0 ? 0 : Math.round((obtainedCount / totalBlueprints) * 100);

  // Load blueprints from database and merge with localStorage
  useEffect(() => {
    async function loadBlueprints() {
      try {
        const dbBlueprints = await getBlueprints();
        const storedData = localStorage.getItem(STORAGE_KEY);
        let statusMap: Record<string, { status: BlueprintStatus; duplicate?: boolean }> = {};

        if (storedData) {
          try {
            statusMap = JSON.parse(storedData);
          } catch (e) {
            console.error('Failed to parse stored blueprint data:', e);
          }
        }

        const mergedBlueprints = dbBlueprints.map((bp) => ({
          ...bp,
          status: statusMap[bp.id]?.status || 'needed',
          duplicate: statusMap[bp.id]?.duplicate || false,
        }));

        setBlueprints(mergedBlueprints);
      } catch (error) {
        console.error('Error loading blueprints:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBlueprints();
  }, []);

  // Save to localStorage whenever blueprints change
  useEffect(() => {
    if (blueprints.length === 0) return;

    const statusMap: Record<string, { status: BlueprintStatus; duplicate?: boolean }> = {};
    blueprints.forEach((bp) => {
      statusMap[bp.id] = {
        status: bp.status,
        duplicate: bp.duplicate,
      };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap));
  }, [blueprints]);

  const filteredBlueprints = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return blueprints.filter((bp) => {
      const matchesQuery = query.length === 0 || bp.name.toLowerCase().includes(query);
      if (!matchesQuery) return false;
      if (tab === 'needed') return bp.status === 'needed';
      if (tab === 'obtained') return bp.status === 'obtained';
      if (tab === 'duplicates') return bp.status === 'obtained' && bp.duplicate;
      return false;
    });
  }, [blueprints, searchQuery, tab]);

  const toggleFavourite = () => setFavorited((prev) => !prev);

  const updateBlueprint = (id: string, updater: (bp: Blueprint) => Blueprint) => {
    setBlueprints((prev) => prev.map((bp) => (bp.id === id ? updater(bp) : bp)));
  };

  const handleCardClick = (bp: Blueprint) => {
    if (tab === 'needed') {
      updateBlueprint(bp.id, (current) => ({ ...current, status: 'obtained' }));
    } else if (tab === 'obtained') {
      updateBlueprint(bp.id, (current) => ({ ...current, status: 'needed', duplicate: false }));
    } else if (tab === 'duplicates') {
      updateBlueprint(bp.id, (current) => ({ ...current, duplicate: false }));
    }
  };

  const handleCardRightClick = (event: MouseEvent, bp: Blueprint) => {
    event.preventDefault();
    if (tab === 'needed') {
      updateBlueprint(bp.id, (current) => ({ ...current, status: 'obtained', duplicate: true }));
    } else if (tab === 'obtained') {
      updateBlueprint(bp.id, (current) => ({ ...current, duplicate: !current.duplicate }));
    } else if (tab === 'duplicates') {
      updateBlueprint(bp.id, (current) => ({ ...current, duplicate: false }));
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">جاري التحميل...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">متتبع المخططات</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground border border-dashed border-border/70 rounded-full px-3 py-1 bg-muted/40">
              <Link href="/" className="hover:text-foreground transition-colors">
                آرك رايدرز
              </Link>
              <span className="text-border">›</span>
              <span className="text-foreground font-semibold">متتبع المخططات</span>
            </div>
          </div>

          <button
            onClick={toggleFavourite}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors shadow-sm',
              favorited
                ? 'border-primary/70 bg-primary/10 text-primary'
                : 'border-border bg-muted/40 text-foreground hover:border-primary/60'
            )}
          >
            {favorited ? <Star className="w-4 h-4 fill-primary text-primary" /> : <StarOff className="w-4 h-4" />}
            {favorited ? 'مضاف للمفضلة' : 'أضف للمفضلة'}
          </button>
        </div>

        {/* Intro line */}
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          تتبع المخططات التي حصلت عليها في آرك رايدرز. انقر على المخطط لوضع علامة عليه كمُحصّل. يتم حفظ تقدمك تلقائيًا في المتصفح.
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-3 shadow-sm">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن المخططات بالاسم..."
            className="w-full bg-transparent focus:outline-none text-sm md:text-base placeholder:text-muted-foreground/70"
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'إجمالي المخططات', value: totalBlueprints },
            { label: 'محصّل', value: obtainedCount },
            { label: 'مطلوب', value: neededCount },
            { label: 'نسخ مكررة', value: duplicateCount },
            { label: 'التقدم', value: `${progressPercent}%` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card/70 px-4 py-3 shadow-sm flex flex-col gap-1"
            >
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</span>
              <span className="text-xl font-bold text-foreground">{stat.value}</span>
              {stat.label === 'التقدم' && (
                <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {[
            { key: 'needed', label: 'مطلوب', count: neededCount },
            { key: 'obtained', label: 'محصّل', count: obtainedCount },
            { key: 'duplicates', label: 'نسخ مكررة', count: duplicateCount },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setTab(filter.key as Tab)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                tab === filter.key
                  ? 'border-primary/70 bg-primary/10 text-primary shadow-sm'
                  : 'border-border text-foreground hover:border-primary/60'
              )}
            >
              {filter.label}
              {typeof filter.count === 'number' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/60">
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content panels */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BadgeCheck className="w-4 h-4 text-primary" />
            {tab === 'needed' && (
              <span>
                انقر بزر الماوس الأيسر لنقل المخطط إلى محصّل. انقر بزر الماوس الأيمن لتتبعه كنسخة مكررة.
              </span>
            )}
            {tab === 'obtained' && (
              <span>
                انقر بزر الماوس الأيسر لإرجاع المخطط إلى مطلوب. انقر بزر الماوس الأيمن لتبديل حالة النسخة المكررة.
              </span>
            )}
            {tab === 'duplicates' && (
              <span>
                انقر بزر الماوس الأيسر لإزالة علامة النسخة المكررة (يبقى في محصّل). استخدم تبويبات مطلوب/محصّل لنقل العناصر بين القوائم.
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
            {filteredBlueprints.map((bp) => (
              <button
                key={bp.id}
                onClick={() => handleCardClick(bp)}
                onContextMenu={(e) => handleCardRightClick(e, bp)}
                className="group flex flex-col items-center gap-1 p-1 text-center transition-transform hover:-translate-y-0.5"
              >
                <div className="relative h-16 w-16 sm:h-[72px] sm:w-[72px] md:h-20 md:w-20 rounded-lg overflow-hidden border border-border">
                  {/* Background image */}
                  <Image
                    src="/images/trackers/blueprint-bg.webp"
                    alt=""
                    fill
                    className="object-cover"
                    priority={false}
                  />
                  {/* Blueprint icon */}
                  <Image
                    src={bp.icon || '/images/items/placeholder.jpg'}
                    alt={bp.name}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105 relative z-10 p-1"
                    priority={false}
                  />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
                    {bp.name}
                  </span>
                </div>
              </button>
            ))}
            {filteredBlueprints.length === 0 && (
              <div className="col-span-full rounded-lg border border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                لا توجد مخططات تطابق الفلاتر الخاصة بك حتى الآن.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
