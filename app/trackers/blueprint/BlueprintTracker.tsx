'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Check,
  Filter,
  Lock,
  Search,
  Sparkles,
  Star,
  StarOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlueprints, type Blueprint as DbBlueprint } from './actions';
import { getBlueprintVotes, voteForLocation } from './location-votes-actions';
import type { VoteCategory as DbVoteCategory } from '@/lib/generated/prisma/client';

type BlueprintStatus = 'needed' | 'obtained';

type Blueprint = DbBlueprint & {
  status: BlueprintStatus;
  duplicate?: boolean;
};

type Tab = 'needed' | 'obtained' | 'duplicates' | 'locations';
type VoteCategory = 'Containers' | 'Maps' | 'Events';

type VoteEntry = {
  name: string;
  voteCount: number;
  category: VoteCategory;
};

type VoteToggleState = Record<VoteCategory, string[]>;

const STORAGE_KEY = 'arc-blueprint-tracker';
const VOTE_STORAGE_KEY = 'arc-blueprint-votes';
const USER_VOTE_STORAGE_KEY = 'arc-blueprint-user-votes';
const USER_VOTER_COUNT_KEY = 'arc-blueprint-unique-voters';

const emptyVoteToggleState: VoteToggleState = {
  Containers: [],
  Maps: [],
  Events: [],
};

const voteCategories: VoteCategory[] = ['Containers', 'Maps', 'Events'];

// Initial location vote data for all blueprints
const initialLocationVotes: Record<string, VoteEntry[]> = {};

export default function BlueprintTracker() {
  const [tab, setTab] = useState<Tab>('needed');
  const [searchQuery, setSearchQuery] = useState('');
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  // Location voting state
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null);
  const [activeVoteFilter, setActiveVoteFilter] = useState<VoteCategory>('Containers');
  const [voteData, setVoteData] = useState<Record<string, VoteEntry[]>>({});
  const [userVotedLocations, setUserVotedLocations] = useState<Record<string, Set<string>>>({});
  const [votingInProgress, setVotingInProgress] = useState(false);

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

  // Load votes for selected blueprint
  useEffect(() => {
    if (!selectedBlueprintId) return;

    async function loadVotes() {
      try {
        const data = await getBlueprintVotes(selectedBlueprintId!);

        // Convert database votes to VoteEntry format
        const votes: VoteEntry[] = data.votes.map((vote) => ({
          name: vote.locationName,
          voteCount: vote.voteCount,
          category: vote.category === 'CONTAINERS' ? 'Containers' : vote.category === 'MAPS' ? 'Maps' : 'Events',
        }));

        // Track user's voted locations
        const userVotedSet = new Set(data.userVotes.map((v) => `${v.category}||${v.locationName}`));

        setVoteData((prev) => ({ ...prev, [selectedBlueprintId!]: votes }));
        setUserVotedLocations((prev) => ({ ...prev, [selectedBlueprintId!]: userVotedSet }));
      } catch (error) {
        console.error('Error loading votes:', error);
      }
    }

    loadVotes();
  }, [selectedBlueprintId]);

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

  // Location voting computed values and handlers
  const locationOptions = useMemo(() => {
    const query = locationQuery.trim().toLowerCase();
    if (query.length >= 2) {
      return blueprints.filter((bp) => bp.name.toLowerCase().includes(query));
    }
    return [];
  }, [blueprints, locationQuery]);

  const selectedBlueprint = useMemo(
    () => blueprints.find((bp) => bp.id === selectedBlueprintId) ?? null,
    [blueprints, selectedBlueprintId]
  );

  // All possible locations by category
  const allLocations = useMemo(() => {
    const locations: Record<VoteCategory, string[]> = {
      Containers: ['Ammo Crate', 'Android', 'Arc Courier', 'Arc Husk', 'Arc Probe', 'Bags', 'Baron Husk', 'Baskets', 'Boxes', 'Breachable Container', 'Cars', 'Container', 'Lockers', 'Med Crate', 'Raider Cache', 'Security Breach', 'Utility Crate', 'Weapon Case'],
      Maps: ['Stella Montis', 'Blue Gate', 'Buried City', 'Dam Battlegrounds', 'The Spaceport'],
      Events: ['Cold Snap', 'Electromagnetic Storm', 'Harvester', 'Husk Graveyard', 'Launch Tower Loot', 'Lush Blooms', 'Matriarch', 'Night Raid', 'Prospecting Probes', 'Uncovered Caches'],
    };
    return locations;
  }, []);

  // Display votes for active category with all locations
  const displayVotes = useMemo(() => {
    const blueprintVotes = selectedBlueprint ? (voteData[selectedBlueprint.id] || []) : [];
    const categoryLocations = allLocations[activeVoteFilter];

    // Create a map of existing votes
    const voteMap = new Map<string, number>();
    blueprintVotes
      .filter((v) => v.category === activeVoteFilter)
      .forEach((v) => {
        voteMap.set(v.name, v.voteCount);
      });

    // Return all locations with their vote counts
    return categoryLocations.map((locationName) => ({
      name: locationName,
      voteCount: voteMap.get(locationName) || 0,
      category: activeVoteFilter,
    }));
  }, [selectedBlueprint, voteData, activeVoteFilter, allLocations]);

  // Check if user has voted for a location
  const hasUserVoted = (locationName: string): boolean => {
    if (!selectedBlueprint) return false;
    const userVoted = userVotedLocations[selectedBlueprint.id] || new Set();
    return userVoted.has(`${activeVoteFilter.toUpperCase()}||${locationName}`);
  };

  // Handle voting for a location
  const handleVoteClick = async (locationName: string) => {
    if (!selectedBlueprint || votingInProgress) {
      console.log('Vote blocked:', { hasBlueprint: !!selectedBlueprint, votingInProgress });
      return;
    }

    // Don't allow voting if already voted
    if (hasUserVoted(locationName)) {
      console.log('User already voted for:', locationName);
      return;
    }

    console.log('Starting vote for:', locationName);
    setVotingInProgress(true);

    try {
      // Convert category to database enum format
      const dbCategory: DbVoteCategory =
        activeVoteFilter === 'Containers'
          ? 'CONTAINERS'
          : activeVoteFilter === 'Maps'
          ? 'MAPS'
          : 'EVENTS';

      console.log('Calling voteForLocation with:', { blueprintId: selectedBlueprint.id, locationName, dbCategory });
      const result = await voteForLocation(selectedBlueprint.id, locationName, dbCategory);
      console.log('Vote result:', result);

      if (result.success) {
        console.log('Vote successful, reloading data...');
        // Reload votes to get updated counts
        const data = await getBlueprintVotes(selectedBlueprint.id);
        console.log('Reloaded data:', data);

        const votes: VoteEntry[] = data.votes.map((vote) => ({
          name: vote.locationName,
          voteCount: vote.voteCount,
          category:
            vote.category === 'CONTAINERS'
              ? 'Containers'
              : vote.category === 'MAPS'
              ? 'Maps'
              : 'Events',
        }));

        const userVotedSet = new Set(
          data.userVotes.map((v) => `${v.category}||${v.locationName}`)
        );

        setVoteData((prev) => ({ ...prev, [selectedBlueprint.id]: votes }));
        setUserVotedLocations((prev) => ({ ...prev, [selectedBlueprint.id]: userVotedSet }));
        console.log('Vote data updated successfully');
      } else {
        console.error('Vote failed:', result.error);
        alert('فشل التصويت: ' + (result.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('حدث خطأ أثناء التصويت. يرجى المحاولة مرة أخرى.');
    } finally {
      setVotingInProgress(false);
    }
  };

  // Total votes for the selected blueprint across all categories
  const totalVotesCount = useMemo(() => {
    if (!selectedBlueprint) return 0;
    const blueprintVotes = voteData[selectedBlueprint.id] || [];
    return blueprintVotes.reduce((sum, vote) => sum + vote.voteCount, 0);
  }, [selectedBlueprint, voteData]);

  // Count unique voters (people who voted at least once)
  const uniqueVotersCount = useMemo(() => {
    if (!selectedBlueprint) return 0;
    const blueprintVotes = voteData[selectedBlueprint.id] || [];
    // Get the max vote count as an approximation of unique voters
    return blueprintVotes.length > 0 ? Math.max(...blueprintVotes.map(v => v.voteCount), 0) : 0;
  }, [selectedBlueprint, voteData]);

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
            { key: 'locations', label: 'المواقع', count: undefined },
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
        {tab !== 'locations' ? (
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
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">رؤى مواقع المخططات</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  ابحث عن مخطط لمعرفة أين يقول المجتمع إنهم وجدوه وأدلِ بأصواتك الخاصة.
                </p>
              </div>
              {selectedBlueprint && (
                <button
                  onClick={() => setSelectedBlueprintId(null)}
                  className="text-xs font-semibold rounded-full bg-orange-500 text-white px-3 py-2 shadow hover:bg-orange-600 transition-colors"
                >
                  مسح التحديد
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-3 shadow-sm">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="ابحث عن المخططات للحصول على رؤى المواقع..."
                className="w-full bg-transparent focus:outline-none text-sm md:text-base placeholder:text-muted-foreground/70"
              />
            </div>

            {selectedBlueprint && (
              <div className="rounded-lg border border-border bg-card/70 px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border">
                      <Image
                        src="/images/trackers/blueprint-bg.webp"
                        alt=""
                        fill
                        className="object-cover"
                      />
                      <Image
                        src={selectedBlueprint.icon || '/images/items/placeholder.jpg'}
                        alt={selectedBlueprint.name}
                        fill
                        className="object-contain p-1 relative z-10"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{selectedBlueprint.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedBlueprint.description || 'لا يوجد وصف'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">الناخبون الفريدون</p>
                    <p className="text-lg font-bold text-foreground">{uniqueVotersCount}</p>
                  </div>
                </div>
              </div>
            )}

            {!selectedBlueprint && locationQuery.trim().length >= 2 && (
              <div className="space-y-2">
                {locationOptions.map((bp) => (
                  <button
                    key={bp.id}
                    onClick={() => setSelectedBlueprintId(bp.id)}
                    className={cn(
                      'flex items-center gap-3 w-full rounded-lg border px-3 py-2 text-sm font-semibold transition-colors shadow-sm text-left',
                      selectedBlueprintId === bp.id
                        ? 'border-primary/70 bg-primary/10 text-primary'
                        : 'border-border bg-card/70 text-foreground hover:border-primary/60'
                    )}
                  >
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border">
                      <Image
                        src="/images/trackers/blueprint-bg.webp"
                        alt=""
                        fill
                        className="object-cover"
                      />
                      <Image
                        src={bp.icon || '/images/items/placeholder.jpg'}
                        alt={bp.name}
                        fill
                        className="object-contain p-1 relative z-10"
                      />
                    </div>
                    <span className="line-clamp-2">{bp.name}</span>
                  </button>
                ))}
                {locationOptions.length === 0 && (
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
                    لا توجد مخططات تطابق هذا البحث.
                  </div>
                )}
              </div>
            )}

            {selectedBlueprint && (
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-xl border border-border bg-card/70 p-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">أصوات المواقع</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        إجمالي الأصوات: {totalVotesCount}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {voteCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setActiveVoteFilter(category)}
                          className={cn(
                            'inline-flex w-full items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                            activeVoteFilter === category
                              ? 'border-primary/70 bg-primary/10 text-primary shadow-sm'
                              : 'border-border/70 bg-muted/30 text-foreground hover:border-primary/60 hover:bg-muted/50'
                          )}
                        >
                          {category === 'Containers' ? 'الحاويات' : category === 'Maps' ? 'الخرائط' : 'الأحداث'}
                        </button>
                      ))}
                    </div>


                    <div className="space-y-2">
                      {displayVotes.length > 0 ? (
                        displayVotes.map((vote) => {
                          const userVoted = hasUserVoted(vote.name);
                          return (
                            <button
                              type="button"
                              key={`${selectedBlueprint.id}-${vote.category}-${vote.name}`}
                              onClick={() => handleVoteClick(vote.name)}
                              disabled={userVoted || votingInProgress}
                              className={cn(
                                'flex items-center justify-between gap-3 w-full text-left rounded-lg border px-3 py-2 transition-colors',
                                userVoted
                                  ? 'border-primary/70 bg-primary/10 cursor-default'
                                  : 'border-border bg-muted/40 hover:bg-muted/60 hover:border-primary/50'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {userVoted && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                <p className={cn(
                                  'text-sm font-semibold',
                                  userVoted ? 'text-primary' : 'text-foreground'
                                )}>{vote.name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {vote.voteCount} {vote.voteCount === 1 ? 'صوت' : 'أصوات'}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground text-center">
                          لا توجد مواقع في هذه الفئة.
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      انقر على موقع للتصويت بأنك وجدت المخطط هناك. يمكنك التصويت مرة واحدة فقط لكل موقع.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
