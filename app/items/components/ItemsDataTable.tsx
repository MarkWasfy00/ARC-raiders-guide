'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ArrowDownUp, Filter, Search } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";

const rarityOrder: Record<string, number> = { LEGENDARY: 5, EPIC: 4, RARE: 3, UNCOMMON: 2, COMMON: 1 };

type SortField = "name" | "rarity" | "value" | "type";
type SortDirection = "asc" | "desc";

type Item = {
  id: string;
  name: string;
  description: string;
  item_type: string | null;
  icon: string | null;
  rarity: string | null;
  value: number;
  weight: number;
};

const ITEM_TYPES = [
  'ADVANCED_MATERIAL',
  'AMMUNITION',
  'AUGMENT',
  'BASIC_MATERIAL',
  'BLUEPRINT',
  'CONSUMABLE',
  'COSMETIC',
  'GADGET',
  'KEY',
  'MATERIAL',
  'MEDICAL',
  'MISC',
  'MODIFICATION',
  'MODS',
  'NATURE',
  'QUEST_ITEM',
  'QUICK_USE',
  'RECYCLABLE',
  'REFINED_MATERIAL',
  'REFINEMENT',
  'SHIELD',
  'THROWABLE',
  'TOPSIDE_MATERIAL',
  'TRINKET',
  'WEAPON',
];

const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];

const rarityStyles: Record<string, { bg: string; color: string }> = {
  COMMON: { bg: "hsl(0 0% 18% / 0.6)", color: "hsl(0 0% 60%)" },
  UNCOMMON: { bg: "hsl(120 40% 50% / 0.2)", color: "hsl(120 40% 50%)" },
  RARE: { bg: "hsl(210 80% 55% / 0.2)", color: "hsl(210 80% 55%)" },
  EPIC: { bg: "hsl(270 70% 60% / 0.2)", color: "hsl(270 70% 60%)" },
  LEGENDARY: { bg: "hsl(40 95% 55% / 0.2)", color: "hsl(40 95% 55%)" },
};

const formatEnumValue = (value: string | null) => {
  if (!value) return '-';
  return value
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export function ItemsDataTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<Item[]>([]);
  const [allData, setAllData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [valueRange, setValueRange] = useState<{ min?: number; max?: number }>({});
  const [valueDraft, setValueDraft] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const pageSize = 12;

  // Fetch items from API with reasonable batch size
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        // Fetch in batches for better performance (500 items per batch)
        const batchSize = 500;
        let allItems: Item[] = [];
        let page = 1;
        let hasMore = true;

        // First batch - show loading state
        const firstResponse = await fetch(`/api/items?pageSize=${batchSize}&page=1`);
        const firstResult = await firstResponse.json();

        if (firstResult.success) {
          allItems = firstResult.data;
          setAllData(allItems);
          setLoading(false); // Show first batch immediately

          // Continue fetching remaining batches in background
          const totalPages = firstResult.pagination?.totalPages || 1;

          if (totalPages > 1) {
            const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);

            // Fetch remaining pages in parallel (max 3 concurrent)
            for (let i = 0; i < remainingPages.length; i += 3) {
              const batch = remainingPages.slice(i, i + 3);
              const results = await Promise.all(
                batch.map(p => fetch(`/api/items?pageSize=${batchSize}&page=${p}`).then(r => r.json()))
              );

              results.forEach(result => {
                if (result.success) {
                  allItems = [...allItems, ...result.data];
                }
              });

              setAllData([...allItems]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Filter and sort data
  const filtered = useMemo(() => {
    let next = allData;

    if (search) {
      const q = search.toLowerCase();
      next = next.filter((item) => item.name.toLowerCase().includes(q));
    }

    if (rarityFilter) {
      next = next.filter((item) => rarityFilter === (item.rarity || "COMMON"));
    }

    if (typeFilter) {
      next = next.filter((item) => item.item_type && typeFilter === item.item_type);
    }

    if (valueRange.min !== undefined) {
      next = next.filter((item) => (item.value || 0) >= valueRange.min!);
    }

    if (valueRange.max !== undefined) {
      next = next.filter((item) => (item.value || 0) <= valueRange.max!);
    }

    const sorted = [...next].sort((a, b) => {
      switch (sortField) {
        case "type": {
          const left = a.item_type || "";
          const right = b.item_type || "";
          return sortDir === "asc" ? left.localeCompare(right) : right.localeCompare(left);
        }
        case "value":
          return sortDir === "asc" ? (a.value || 0) - (b.value || 0) : (b.value || 0) - (a.value || 0);
        case "rarity": {
          const left = rarityOrder[(a.rarity || "COMMON")] || 0;
          const right = rarityOrder[(b.rarity || "COMMON")] || 0;
          return sortDir === "asc" ? left - right : right - left;
        }
        case "name":
        default:
          return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
    });

    return sorted;
  }, [allData, search, rarityFilter, typeFilter, sortField, sortDir, valueRange.min, valueRange.max]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageParam = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const updateSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const toggleRarity = (value: string) => {
    setRarityFilter((prev) => (prev === value ? "" : value));
  };

  const toggleType = (value: string) => {
    setTypeFilter((prev) => (prev === value ? "" : value));
  };

  const applyValueRange = (min?: number, max?: number) => {
    setValueRange({ min, max });
  };

  useEffect(() => {
    setValueDraft({
      min: valueRange.min !== undefined ? String(valueRange.min) : "",
      max: valueRange.max !== undefined ? String(valueRange.max) : "",
    });
  }, [valueRange.min, valueRange.max]);

  return (
    <div className="w-full space-y-6" dir="ltr">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          placeholder="ابحث عن العناصر..."
          className="w-full rounded-lg border border-border bg-card px-10 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">
                  <button
                    type="button"
                    onClick={() => updateSort("name")}
                    className="flex items-center gap-1 font-medium transition hover:text-foreground"
                  >
                    الاسم
                    <ArrowDownUp className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-3 py-2 text-left">الوصف</th>
                <th className="px-3 py-2 text-left">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSort("rarity")}
                      className="flex items-center gap-1 font-medium transition hover:text-foreground"
                    >
                      الندرة
                      <ArrowDownUp className="h-3.5 w-3.5" />
                    </button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`rounded p-1 ${
                            rarityFilter ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
                          }`}
                          aria-label="Filter by rarity"
                        >
                          <Filter className="h-3.5 w-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-48 space-y-2 border-border bg-card p-3 text-sm shadow-lg">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <span>الندرة</span>
                          <button
                            type="button"
                            onClick={() => setRarityFilter("")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            مسح
                          </button>
                        </div>
                        <div className="flex flex-col gap-1">
                          {RARITIES.map((r) => {
                            const active = rarityFilter === r;
                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => toggleRarity(r)}
                                className={cn(
                                  "flex w-full items-center justify-between rounded px-3 py-2 text-left text-foreground transition",
                                  active ? "bg-secondary text-foreground" : "hover:bg-secondary/40"
                                )}
                              >
                                <span className="capitalize">{formatEnumValue(r)}</span>
                                {active && <ArrowDownUp className="h-3 w-3 text-primary" />}
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSort("value")}
                      className="flex items-center gap-1 font-medium transition hover:text-foreground"
                    >
                      القيمة
                      <ArrowDownUp className="h-3.5 w-3.5" />
                    </button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`rounded p-1 ${
                            valueRange.min !== undefined || valueRange.max !== undefined
                              ? "bg-secondary text-foreground"
                              : "text-muted-foreground hover:bg-secondary"
                          }`}
                          aria-label="Filter by value range"
                        >
                          <Filter className="h-3.5 w-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-56 space-y-3 border-border bg-card p-3 text-sm shadow-lg">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <span>نطاق القيمة</span>
                          <button
                            type="button"
                            onClick={() => setValueRange({})}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            مسح
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="text-xs text-muted-foreground">
                            الحد الأدنى
                            <input
                              value={valueDraft.min}
                              onChange={(e) =>
                                setValueDraft((prev) => ({ ...prev, min: e.target.value.replace(/[^0-9]/g, "") }))
                              }
                              className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                              inputMode="numeric"
                            />
                          </label>
                          <label className="text-xs text-muted-foreground">
                            الحد الأقصى
                            <input
                              value={valueDraft.max}
                              onChange={(e) =>
                                setValueDraft((prev) => ({ ...prev, max: e.target.value.replace(/[^0-9]/g, "") }))
                              }
                              className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                              inputMode="numeric"
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            applyValueRange(
                              valueDraft.min ? Number(valueDraft.min) : undefined,
                              valueDraft.max ? Number(valueDraft.max) : undefined
                            )
                          }
                          className="w-full rounded bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                        >
                          تطبيق
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="px-3 py-2 text-left">الوزن</th>
                <th className="px-3 py-2 text-left">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSort("type")}
                      className="flex items-center gap-1 font-medium transition hover:text-foreground"
                    >
                      النوع
                      <ArrowDownUp className="h-3.5 w-3.5" />
                    </button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`rounded p-1 ${
                            typeFilter ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
                          }`}
                          aria-label="Filter by type"
                        >
                          <Filter className="h-3.5 w-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-56 space-y-2 border-border bg-card p-3 text-sm shadow-lg">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <span>النوع</span>
                          <button
                            type="button"
                            onClick={() => setTypeFilter("")}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            مسح
                          </button>
                        </div>
                        <div className="flex flex-col gap-1">
                          {ITEM_TYPES.map((t) => {
                            const active = typeFilter === t;
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => toggleType(t)}
                                className={cn(
                                  "flex w-full items-center justify-between rounded px-3 py-2 text-left text-foreground transition",
                                  active ? "bg-secondary text-foreground" : "hover:bg-secondary/40"
                                )}
                              >
                                <span>{formatEnumValue(t)}</span>
                                {active && <ArrowDownUp className="h-3 w-3 text-primary" />}
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    جاري التحميل...
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/60 transition hover:bg-secondary/30"
                  >
                    <td className="px-3 py-3">
                      <Link href={`/items/${item.id}`} className="flex items-center gap-3 text-foreground transition hover:text-primary">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary">
                          {item.icon ? (
                            <Image src={item.icon} alt="" width={40} height={40} className="h-10 w-10 rounded object-contain" />
                          ) : (
                            <span className="text-xs text-muted-foreground">?</span>
                          )}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <p className="line-clamp-2 text-xs sm:text-sm">{item.description || "-"}</p>
                    </td>
                    <td className="px-3 py-3">
                      {(() => {
                        const key = (item.rarity || "COMMON");
                        const style = rarityStyles[key] || rarityStyles.COMMON;
                        return (
                          <span
                            className="rounded px-2 py-1 text-xs font-semibold uppercase"
                            style={{ backgroundColor: style.bg, color: style.color }}
                          >
                            {formatEnumValue(item.rarity)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-primary">
                        {item.value ?? 0}
                        <Image
                          src="/images/coins/coin.webp"
                          alt="Coin"
                          width={16}
                          height={16}
                          className="inline-block"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {item.weight ? `${item.weight} KG` : "0 KG"}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{formatEnumValue(item.item_type)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    لا توجد عناصر. حاول تعديل الفلاتر.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination basePath="/items" currentPage={safePage} totalPages={totalPages} className="pt-2" />
    </div>
  );
}
