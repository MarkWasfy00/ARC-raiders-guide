'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Eye, EyeOff, Heart, HeartOff, Search, Trash2, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { getLoadouts, deleteLoadout as deleteLoadoutAction } from '@/app/features/loadouts/services/loadouts-actions';
import type { Loadout as DBLoadout } from '@/app/features/loadouts/types';

const TAGS: string[] = [
  'PvP',
  'PvE',
  'منفرد',
  'ثنائي',
  'ثلاثي',
  'قريب المدى',
  'متوسط المدى',
  'بعيد المدى',
];

type DisplayLoadout = {
  id: string;
  name: string;
  author: string;
  authorId: string | null;
  date: string;
  tags: string[];
  description?: string;
  isMine: boolean;
  isPublic: boolean;
  loadoutData: any;
  totalWeight?: number;
  totalPrice?: number;
};

const formatDate = (value: Date | string) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('ar', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

export default function CommunityLoadoutsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [mode, setMode] = useState<'public' | 'mine'>('public');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loadoutData, setLoadoutData] = useState<DisplayLoadout[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  // Fetch loadouts from database
  const fetchLoadouts = async (page: number, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
      setCurrentPage(1);
    } else {
      setLoadingMore(true);
    }

    const result = await getLoadouts({
      page,
      pageSize,
      userId: mode === 'mine' ? session?.user?.id : undefined,
      isPublic: mode === 'public' ? true : undefined,
      search: searchTerm || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });

    if (result.success && result.data) {
      const transformed: DisplayLoadout[] = result.data.loadouts.map((loadout: any) => ({
        id: loadout.id,
        name: loadout.name,
        author: loadout.user?.username || loadout.user?.embark_id || 'مجهول',
        authorId: loadout.userId,
        date: loadout.created_at.toString(),
        tags: loadout.tags,
        description: loadout.description || undefined,
        isMine: loadout.userId === session?.user?.id,
        isPublic: loadout.is_public,
        loadoutData: loadout.loadoutData,
        totalWeight: loadout.totalWeight,
        totalPrice: loadout.totalPrice,
      }));

      if (reset || page === 1) {
        setLoadoutData(transformed);
      } else {
        setLoadoutData((prev) => [...prev, ...transformed]);
      }

      setHasMore(result.data.hasMore);
      setTotal(result.data.total);
      setCurrentPage(page);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  // Initial load and filter changes
  useEffect(() => {
    fetchLoadouts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, mode]);

  // Load more handler
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchLoadouts(currentPage + 1);
    }
  };

  // Apply search button handler
  const handleSearch = () => {
    fetchLoadouts(1, true);
  };

  // Client-side sorting only (filtering is done server-side)
  const filteredLoadouts = useMemo(() => {
    return [...loadoutData].sort((a, b) => {
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
  }, [sortBy, sortDirection, loadoutData]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    // Refetch with cleared filters
    setTimeout(() => fetchLoadouts(1, true), 0);
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/loadouts/${id}`;
    void navigator.clipboard.writeText(url);
  };

  const deleteLoadout = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحمولة؟')) return;

    const result = await deleteLoadoutAction(id);
    if (result.success) {
      setLoadoutData((prev) => prev.filter((loadout) => loadout.id !== id));
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

  // Get item icon from loadoutData
  const getItemIcon = (itemId: string | null) => {
    if (!itemId) return null;
    return `https://cdn.metaforge.app/arc-raiders/icons/${itemId}.webp`;
  };

  // Get equipment preview data from loadout
  const getEquipmentPreview = (loadoutData: any) => {
    return {
      primaryWeapon: loadoutData?.weaponprimary || null,
      secondaryWeapon: loadoutData?.weaponsecondary || null,
      bag: loadoutData?.augment || null,
      shield: loadoutData?.shield || null,
    };
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">حمولات المجتمع</h1>
            <p className="text-sm text-muted-foreground">Arc Raiders &lt; الحمولات</p>
          </div>
          <button
            onClick={() => setFavorited((prev) => !prev)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors',
              favorited
                ? 'border-primary/70 bg-primary/10 text-primary'
                : 'border-border bg-card/60 text-foreground hover:border-primary/60'
            )}
          >
            {favorited ? <Heart className="w-4 h-4 fill-primary text-primary" /> : <HeartOff className="w-4 h-4" />}
            {favorited ? 'تمت الإضافة للمفضلة' : 'إضافة للمفضلة'}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="rounded-lg border border-border bg-card/60 p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[250px]">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="ابحث عن حمولة بالاسم..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm pl-10 transition-all focus:border-primary focus:outline-none"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>

            <button
              type="button"
              onClick={() => setTagsOpen((prev) => !prev)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors',
                tagsOpen
                  ? 'border-primary/70 bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              )}
            >
              الوسوم
            </button>

            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Search className="h-4 w-4" />
              بحث
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background p-2.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="مسح الفلاتر"
            >
              <X className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => router.push('/loadouts/create')}
              className="mr-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              إنشاء حمولة
            </button>
          </div>

          {/* Tags Panel */}
          {tagsOpen && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                      active
                        ? 'border-primary/70 bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-card/60 p-1.5">
          <button
            type="button"
            onClick={() => setMode('public')}
            className={cn(
              'rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
              mode === 'public'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            الحمولات العامة
          </button>
          <button
            type="button"
            onClick={() => setMode('mine')}
            className={cn(
              'rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
              mode === 'mine'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            حمولاتي
          </button>
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            الترتيب
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSortByName}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                sortBy === 'name'
                  ? 'border-primary/70 bg-primary/10 text-primary'
                  : 'border-border bg-card/60 text-muted-foreground hover:text-foreground'
              )}
            >
              حسب الاسم {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              type="button"
              onClick={handleSortByDate}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                sortBy === 'date'
                  ? 'border-primary/70 bg-primary/10 text-primary'
                  : 'border-border bg-card/60 text-muted-foreground hover:text-foreground'
              )}
            >
              حسب التاريخ {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Loadouts Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading && (
            <div className="col-span-full rounded-lg border border-border bg-card/60 p-12 text-center">
              <p className="text-sm text-muted-foreground">جاري التحميل...</p>
            </div>
          )}

          {!loading && filteredLoadouts.length === 0 && (
            <div className="col-span-full rounded-lg border border-border bg-card/60 p-12 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === 'mine' ? 'لا توجد حمولات خاصة بك' : 'لا توجد حمولات متاحة'}
              </p>
              {mode === 'mine' && (
                <button
                  type="button"
                  onClick={() => router.push('/loadouts/create')}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  إنشاء أول حمولة
                </button>
              )}
            </div>
          )}

          {!loading && filteredLoadouts.map((loadout) => (
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
              className="group text-right rounded-lg border border-border bg-card/80 p-4 transition-all hover:border-primary/60 hover:shadow-lg cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-lg font-semibold text-foreground">{loadout.name}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      copyLink(loadout.id);
                    }}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="نسخ الرابط"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {loadout.isMine && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteLoadout(loadout.id);
                      }}
                      className="inline-flex items-center justify-center rounded-lg border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                بواسطة{' '}
                {loadout.isMine ? (
                  <span className="inline-flex items-center rounded-lg border border-primary/60 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    أنت
                  </span>
                ) : (
                  <span className="text-foreground/80 font-semibold">{loadout.author}</span>
                )}{' '}
                <span className="mr-2">{formatDate(loadout.date)}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {loadout.tags.slice(0, 5).map((tag) => (
                  <span
                    key={`${loadout.id}-${tag}`}
                    className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Equipment Preview */}
              {(() => {
                const equipment = getEquipmentPreview(loadout.loadoutData);
                const hasAnyEquipment = equipment.primaryWeapon || equipment.secondaryWeapon || equipment.bag || equipment.shield;

                if (!hasAnyEquipment) return null;

                return (
                  <div className="mt-4 space-y-2">
                    {/* Weapons Row */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Secondary Weapon */}
                      <div className="relative aspect-[3/2] rounded-lg border-2 border-muted/40 bg-gradient-to-br from-muted/5 to-background overflow-hidden">
                        {equipment.secondaryWeapon ? (
                          <div className="relative w-full h-full p-2 flex items-center justify-center">
                            <Image
                              src={getItemIcon(equipment.secondaryWeapon) || ''}
                              alt="Secondary Weapon"
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 140px, 160px"
                              quality={100}
                            />
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-xs text-muted-foreground">لا يوجد سلاح ثانوي</div>
                          </div>
                        )}
                      </div>

                      {/* Primary Weapon */}
                      <div className="relative aspect-[3/2] rounded-lg border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
                        {equipment.primaryWeapon ? (
                          <div className="relative w-full h-full p-2 flex items-center justify-center">
                            <Image
                              src={getItemIcon(equipment.primaryWeapon) || ''}
                              alt="Primary Weapon"
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 140px, 160px"
                              quality={100}
                            />
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-xs text-muted-foreground">لا يوجد سلاح أساسي</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Equipment Row - Much Smaller */}
                    <div className="flex gap-2">
                      {/* Shield */}
                      <div className="relative w-16 h-16 rounded-lg border-2 border-blue-500/40 bg-gradient-to-br from-blue-500/5 to-background overflow-hidden">
                        {equipment.shield ? (
                          <div className="relative w-full h-full p-1.5 flex items-center justify-center">
                            <Image
                              src={getItemIcon(equipment.shield) || ''}
                              alt="Shield"
                              fill
                              className="object-contain"
                              sizes="64px"
                              quality={100}
                            />
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-[9px] text-muted-foreground text-center leading-tight">لا يوجد</div>
                          </div>
                        )}
                      </div>

                      {/* Bag/Augment */}
                      <div className="relative w-16 h-16 rounded-lg border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/5 to-background overflow-hidden">
                        {equipment.bag ? (
                          <div className="relative w-full h-full p-1.5 flex items-center justify-center">
                            <Image
                              src={getItemIcon(equipment.bag) || ''}
                              alt="Bag"
                              fill
                              className="object-contain"
                              sizes="64px"
                              quality={100}
                            />
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-[9px] text-muted-foreground text-center leading-tight">لا توجد</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {loadout.description && (
                <div className="mt-3 text-xs text-muted-foreground line-clamp-2">
                  {loadout.description}
                </div>
              )}

              {/* Weight and Price Display */}
              {(loadout.totalWeight !== undefined || loadout.totalPrice !== undefined) && (
                <div className="mt-3 flex items-center gap-4 text-xs">
                  {loadout.totalWeight !== undefined && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="font-medium">{loadout.totalWeight.toFixed(1)} كجم</span>
                    </div>
                  )}
                  {loadout.totalPrice !== undefined && (
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="7" />
                      </svg>
                      <span className="font-medium">{loadout.totalPrice.toLocaleString('ar')}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                {loadout.isPublic ? (
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    عامة
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <EyeOff className="h-3 w-3" />
                    خاصة
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Pagination Info and Load More */}
        {!loading && filteredLoadouts.length > 0 && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm text-muted-foreground">
              عرض {filteredLoadouts.length} من أصل {total} حمولة
            </div>

            {hasMore && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    جاري التحميل...
                  </>
                ) : (
                  <>تحميل المزيد</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
