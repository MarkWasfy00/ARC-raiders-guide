'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Filter,
  Loader2,
  Search,
  Star,
  X,
} from "lucide-react";
import { fetchItems } from "@/lib/api";
import { Item } from "@/types";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { items as localItems } from "@/lib/database";

type SortKey = "name" | "rarity" | "value" | "weight" | "item_type";
type SortDir = "asc" | "desc";

type TradeCategory = "seeds" | "barter" | "open";

interface MarketplaceListing {
  id: string;
  type: "WTS" | "WTB";
  item: Item;
  quantity: number;
  currency: TradeCategory;
  pricePerUnit?: number;
  barterFor?: Array<{ item: Item; quantity: number }>;
  note?: string;
  createdAt: string;
  rating: number;
  user: {
    username: string;
    avatar: string;
  };
}

interface WizardState {
  listingType: "WTS" | "WTB";
  tradeType: TradeCategory;
  selectedItem?: Item;
  quantity: number;
  pricePerUnit?: number;
  barterLines: Array<{ id: string; item?: Item; quantity: number }>;
  description: string;
  accepted: boolean;
}

const rarityOrder: Record<string, number> = {
  legendary: 5,
  epic: 4,
  rare: 3,
  uncommon: 2,
  common: 1,
};

const DEFAULT_PAGE_SIZE = 20;
const WELCOME_STORAGE_KEY = "arc-market-welcome";
const EMBARK_ID_KEY = "arc-market-embark-id";

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((v) => set.has(v));
}

function formatDate(date: string) {
  const value = new Date(date);
  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function sortItems(data: Item[], sortKey: SortKey, sortDir: SortDir) {
  const sorted = [...data].sort((a, b) => {
    if (sortKey === "rarity") {
      const left = rarityOrder[(a.rarity || "common").toLowerCase()] || 0;
      const right = rarityOrder[(b.rarity || "common").toLowerCase()] || 0;
      return sortDir === "asc" ? left - right : right - left;
    }
    if (sortKey === "value") {
      const left = a.value ?? 0;
      const right = b.value ?? 0;
      return sortDir === "asc" ? left - right : right - left;
    }
    if (sortKey === "weight") {
      const left = Number(a.stat_block?.weight ?? (a as any).weight ?? 0);
      const right = Number(b.stat_block?.weight ?? (b as any).weight ?? 0);
      return sortDir === "asc" ? left - right : right - left;
    }
    const leftVal = (a as any)[sortKey] ?? "";
    const rightVal = (b as any)[sortKey] ?? "";
    return sortDir === "asc"
      ? String(leftVal).localeCompare(String(rightVal))
      : String(rightVal).localeCompare(String(leftVal));
  });
  return sorted;
}

function buildListingSeed(items: Item[]): MarketplaceListing[] {
  const source = (items.length ? items : localItems).slice(0, 20);
  if (!source.length) return [];
  const now = Date.now();
  const avatars = [
    "https://cdn.metaforge.app/arc-raiders/avatars/1.webp",
    "https://cdn.metaforge.app/arc-raiders/avatars/2.webp",
    "https://cdn.metaforge.app/arc-raiders/avatars/3.webp",
    "https://cdn.metaforge.app/arc-raiders/avatars/4.webp",
    "https://cdn.metaforge.app/arc-raiders/avatars/5.webp",
  ];

  return (source.map((item, idx) => ({
    id: `seed-${item.id}-${idx}`,
    type: idx % 2 === 0 ? "WTS" : "WTB",
    item,
    quantity: Math.max(1, (idx % 3) + 1) * 2,
    currency: idx % 3 === 0 ? "barter" : idx % 3 === 1 ? "open" : "seeds",
    pricePerUnit: item.value ? Math.max(50, Math.round(item.value * 0.8)) : undefined,
    barterFor: [
      {
        item: source[(idx + 2) % source.length] ?? item,
        quantity: 1,
      },
    ],
    note:
      idx % 3 === 1
        ? "Open to creative offers, prefer rare crafting parts."
        : "Fast trade, online most evenings.",
    createdAt: new Date(now - idx * 1000 * 60 * 60 * 8).toISOString(),
    rating: 4 - (idx % 3) + Math.random() * 1,
    user: {
      username: ["GreyFox", "Nyx", "Patch", "Tala", "Axiom", "Riven"][idx % 6] ?? "Raider",
      avatar: avatars[idx % avatars.length],
    },
  })) as MarketplaceListing[]).map((listing, idx) =>
    listing.currency === "barter" && listing.barterFor
      ? {
          ...listing,
          barterFor: listing.barterFor.map((line, lineIdx) => ({
            ...line,
            quantity: line.quantity + lineIdx,
          })),
        }
      : listing
  );
}

function ListingCard({ listing }: { listing: MarketplaceListing }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/80 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src={listing.user.avatar}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
          loading="lazy"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
            <span
              className={cn(
                "rounded px-2 py-0.5 font-semibold tracking-wide",
                listing.type === "WTS" ? "bg-primary/15 text-primary" : "bg-amber-500/10 text-amber-300"
              )}
            >
              {listing.type}
            </span>
            <span className="text-muted-foreground">&bull;</span>
            <span>{formatDate(listing.createdAt)}</span>
          </div>
          <p className="font-semibold leading-tight text-foreground">{listing.user.username}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-4 w-4 text-amber-400" />
            <span>{listing.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Quantity</p>
          <p className="text-lg font-semibold text-primary">{listing.quantity}</p>
        </div>
      </div>

      <div className="flex gap-3 rounded-lg border border-border/70 bg-background/60 p-3">
        <div className="flex h-12 w-12 items-center justify-center rounded bg-secondary/40">
          {listing.item.icon ? (
            <img
              src={listing.item.icon}
              alt={listing.item.name}
              className="h-full w-full rounded object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-xs text-muted-foreground">No image</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase text-muted-foreground">{listing.item.item_type || "Unknown type"}</p>
          <p className="font-semibold text-foreground">{listing.item.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{listing.item.description || "No description"}</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Rarity</p>
          <p className="font-semibold text-foreground">{listing.item.rarity || "Common"}</p>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-dashed border-border/70 bg-secondary/10 p-3">
        {listing.currency === "seeds" && (
          <>
            <p className="text-xs uppercase text-muted-foreground">Seeking</p>
            <p className="text-base font-semibold text-primary">
              {listing.pricePerUnit ? `${listing.pricePerUnit} seeds each` : "Seeds offer"}
            </p>
          </>
        )}
        {listing.currency === "open" && (
          <>
            <p className="text-xs uppercase text-muted-foreground">Open to offers</p>
            <p className="text-sm text-foreground">
              {listing.note || "Share your best offer - flexible on trades."}
            </p>
          </>
        )}
        {listing.currency === "barter" && (
          <>
            <p className="text-xs uppercase text-muted-foreground">Barter items</p>
            <div className="flex flex-wrap gap-2">
              {listing.barterFor?.map((line) => (
                <span
                  key={`${line.item.id}-${line.quantity}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs"
                >
                  <img
                    src={line.item.icon || ""}
                    alt=""
                    className="h-6 w-6 rounded object-contain"
                    loading="lazy"
                  />
                  <span className="font-medium text-foreground">
                    {line.quantity}x {line.item.name}
                  </span>
                </span>
              ))}
            </div>
          </>
        )}
        {listing.note && listing.currency !== "open" && (
          <p className="text-xs text-muted-foreground">{listing.note}</p>
        )}
      </div>
    </div>
  );
}

function ValueRangePopover({
  value,
  onApply,
  onClear,
  isActive,
}: {
  value: { min?: number; max?: number };
  onApply: (val: { min?: number; max?: number }) => void;
  onClear: () => void;
  isActive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [localMin, setLocalMin] = useState<string>(value.min?.toString() || "");
  const [localMax, setLocalMax] = useState<string>(value.max?.toString() || "");

  useEffect(() => {
    setLocalMin(value.min?.toString() || "");
    setLocalMax(value.max?.toString() || "");
  }, [value.min, value.max]);

  const apply = () => {
    const minVal = localMin ? Number(localMin) : undefined;
    const maxVal = localMax ? Number(localMax) : undefined;
    onApply({ min: minVal, max: maxVal });
    setOpen(false);
  };

  const clear = () => {
    setLocalMin("");
    setLocalMax("");
    onClear();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded border border-border px-3 py-2 text-xs font-medium uppercase tracking-wide transition",
            isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
          )}
          aria-label="Value range filter"
        >
          Value
          <Filter className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3 border-border bg-card text-foreground shadow-xl">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Value range</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted-foreground">
            Min
            <input
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              aria-label="Minimum value"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Max
            <input
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              aria-label="Maximum value"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={apply}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Apply
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PaginationControl({
  current,
  total,
  onPageChange,
}: {
  current: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (total <= 1) return null;

  const buildPages = () => {
    const pages: Array<number | string> = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i += 1) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Items pagination">
      <button
        type="button"
        onClick={() => onPageChange(current - 1)}
        disabled={current <= 1}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded border border-border text-sm text-muted-foreground transition",
          "hover:bg-secondary hover:text-foreground",
          current <= 1 && "cursor-not-allowed opacity-50"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {buildPages().map((page, idx) =>
        typeof page === "number" ? (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={current === page ? "page" : undefined}
            className={cn(
              "flex h-9 min-w-[2.25rem] items-center justify-center rounded border border-border text-sm transition",
              current === page
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {page}
          </button>
        ) : (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
            {page}
          </span>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(current + 1)}
        disabled={current >= total}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded border border-border text-sm text-muted-foreground transition",
          "hover:bg-secondary hover:text-foreground",
          current >= total && "cursor-not-allowed opacity-50"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

export default function DatabaseItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams = useParams<{ page?: string }>();
  const pathname = usePathname();
  const routePage = routeParams?.page;
  const isMarketplaceRoute = pathname?.startsWith("/marketplace");

  const initialPageFromRoute = Number(routePage || searchParams.get("page") || 1) || 1;
  const [page, setPage] = useState<number>(initialPageFromRoute);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [rarityFilter, setRarityFilter] = useState<string[]>(
    searchParams.get("rarity")
      ? searchParams
          .get("rarity")!
          .split(",")
          .map((val) => val.toLowerCase())
      : []
  );
  const [typeFilter, setTypeFilter] = useState<string[]>(
    searchParams.get("itemTypes")
      ? searchParams
          .get("itemTypes")!
          .split(",")
          .map((val) => val.toLowerCase())
      : []
  );
  const [valueRange, setValueRange] = useState<{ min?: number; max?: number }>(() => {
    const min = searchParams.get("valueMin");
    const max = searchParams.get("valueMax");
    return {
      min: min ? Number(min) : undefined,
      max: max ? Number(max) : undefined,
    };
  });
  const [sortKey, setSortKey] = useState<SortKey>(
    (searchParams.get("sort") as SortKey) || "name"
  );
  const [sortDir, setSortDir] = useState<SortDir>(
    searchParams.get("dir") === "desc" ? "desc" : "asc"
  );

  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeOptions, setTypeOptions] = useState<string[]>([]);

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [orderType, setOrderType] = useState<"all" | "buy" | "sell">(
    (searchParams.get("orderType") as "all" | "buy" | "sell") || "all"
  );
  const [currencyType, setCurrencyType] = useState<"all" | TradeCategory>(
    (searchParams.get("currency") as "all" | TradeCategory) || "all"
  );
  const [ratingSort, setRatingSort] = useState<"default" | "highest">(
    (searchParams.get("rating") as "default" | "highest") || "default"
  );
  const [listingTypeFilter, setListingTypeFilter] = useState(
    searchParams.get("listingItemType") || "all"
  );
  const [visibleSell, setVisibleSell] = useState(4);
  const [visibleBuy, setVisibleBuy] = useState(4);

  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [embarkId, setEmbarkId] = useState<string | null>(null);
  const [embarkInput, setEmbarkInput] = useState("");
  const [embarkError, setEmbarkError] = useState<string | null>(null);
  const [showEmbarkModal, setShowEmbarkModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardState, setWizardState] = useState<WizardState>({
    listingType: "WTS",
    tradeType: "seeds",
    quantity: 1,
    barterLines: [{ id: "line-1", quantity: 1 }],
    description: "",
    accepted: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedWelcome = localStorage.getItem(WELCOME_STORAGE_KEY);
        if (!storedWelcome) setWelcomeOpen(true);
        const storedEmbark = localStorage.getItem(EMBARK_ID_KEY);
        if (storedEmbark) setEmbarkId(storedEmbark);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchItems({ page: 1, pageSize: 500 })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const dataset = data.length ? data : localItems;
        setAllItems(dataset);
        if (!typeOptions.length) {
          const uniqueTypes = Array.from(
            new Set(dataset.map((item) => item.item_type).filter(Boolean) as string[])
          ).sort();
          setTypeOptions(uniqueTypes);
        }
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to load items. Please retry.";
        setError(message);
        const fallback = localItems;
        setAllItems(fallback);
        if (!typeOptions.length) {
          const uniqueTypes = Array.from(
            new Set(fallback.map((item) => item.item_type).filter(Boolean) as string[])
          ).sort();
          setTypeOptions(uniqueTypes);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (allItems.length && !typeOptions.length) {
      const uniqueTypes = Array.from(
        new Set(allItems.map((item) => item.item_type).filter(Boolean) as string[])
      ).sort();
      setTypeOptions(uniqueTypes);
    }
  }, [allItems, typeOptions.length]);

  useEffect(() => {
    if (!listings.length && allItems.length) {
      setListings(buildListingSeed(allItems));
    }
  }, [listings.length, allItems]);

  const filteredItems = useMemo(() => {
    return allItems
      .filter((item) => {
        if (!searchTerm) return true;
        const value = searchTerm.toLowerCase();
        return (
          item.name.toLowerCase().includes(value) ||
          (item.description || "").toLowerCase().includes(value) ||
          (item.item_type || "").toLowerCase().includes(value)
        );
      })
      .filter((item) => (rarityFilter.length ? rarityFilter.includes((item.rarity || "").toLowerCase()) : true))
      .filter((item) =>
        typeFilter.length ? typeFilter.includes((item.item_type || "").toLowerCase()) : true
      )
      .filter((item) => {
        if (valueRange.min !== undefined && (item.value ?? 0) < valueRange.min) return false;
        if (valueRange.max !== undefined && (item.value ?? 0) > valueRange.max) return false;
        return true;
      });
  }, [allItems, searchTerm, rarityFilter, typeFilter, valueRange.min, valueRange.max]);

  const sortedItems = useMemo(
    () => sortItems(filteredItems, sortKey, sortDir),
    [filteredItems, sortKey, sortDir]
  );

  const totalItems = sortedItems.length;

  const pagedItems = useMemo(() => {
    const start = (page - 1) * DEFAULT_PAGE_SIZE;
    return sortedItems.slice(start, start + DEFAULT_PAGE_SIZE);
  }, [sortedItems, page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / DEFAULT_PAGE_SIZE)),
    [totalItems]
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const updateUrl = (nextPage: number) => {
    const qs = new URLSearchParams(searchParams.toString());
    qs.set("page", nextPage.toString());
    searchTerm ? qs.set("search", searchTerm) : qs.delete("search");
    rarityFilter.length ? qs.set("rarity", rarityFilter.join(",")) : qs.delete("rarity");
    typeFilter.length ? qs.set("itemTypes", typeFilter.join(",")) : qs.delete("itemTypes");
    valueRange.min !== undefined
      ? qs.set("valueMin", valueRange.min.toString())
      : qs.delete("valueMin");
    valueRange.max !== undefined
      ? qs.set("valueMax", valueRange.max.toString())
      : qs.delete("valueMax");
    qs.set("sort", sortKey);
    qs.set("dir", sortDir);
    qs.set("orderType", orderType);
    qs.set("currency", currencyType);
    qs.set("rating", ratingSort);
    listingTypeFilter !== "all"
      ? qs.set("listingItemType", listingTypeFilter)
      : qs.delete("listingItemType");

    const query = qs.toString();
    const base = isMarketplaceRoute ? "/marketplace" : `/database/items/page/${nextPage}`;
    const url = `${base}${query ? `?${query}` : ""}`;
    router.replace(url, { scroll: false });
  };

  useEffect(() => {
    updateUrl(page);
  }, [
    page,
    searchTerm,
    rarityFilter,
    typeFilter,
    valueRange.min,
    valueRange.max,
    sortKey,
    sortDir,
    orderType,
    currencyType,
    ratingSort,
    listingTypeFilter,
  ]);

  useEffect(() => {
    const incomingPage = Number(routePage || searchParams.get("page") || 1) || 1;
    if (incomingPage !== page) setPage(incomingPage);
  }, [routePage, searchParams, page]);

  // Keep state in sync when URL changes (back/forward or shared link)
  useEffect(() => {
    const qp = searchParams;
    const nextSearch = qp.get("search") || "";
    if (nextSearch !== searchInput) setSearchInput(nextSearch);
    if (nextSearch !== searchTerm) setSearchTerm(nextSearch);

    const nextRarity = qp.get("rarity")
      ? qp
          .get("rarity")!
          .split(",")
          .filter(Boolean)
          .map((val) => val.toLowerCase())
      : [];
    if (!arraysEqual(nextRarity, rarityFilter)) setRarityFilter(nextRarity);

    const nextTypes = qp.get("itemTypes")
      ? qp
          .get("itemTypes")!
          .split(",")
          .filter(Boolean)
          .map((val) => val.toLowerCase())
      : [];
    if (!arraysEqual(nextTypes, typeFilter)) setTypeFilter(nextTypes);

    const min = qp.get("valueMin");
    const max = qp.get("valueMax");
    const nextRange = {
      min: min ? Number(min) : undefined,
      max: max ? Number(max) : undefined,
    };
    if (nextRange.min !== valueRange.min || nextRange.max !== valueRange.max) setValueRange(nextRange);

    const nextSort = (qp.get("sort") as SortKey) || "name";
    const nextDir = qp.get("dir") === "desc" ? "desc" : "asc";
    if (nextSort !== sortKey) setSortKey(nextSort);
    if (nextDir !== sortDir) setSortDir(nextDir);

    const nextOrder = (qp.get("orderType") as "all" | "buy" | "sell") || "all";
    if (nextOrder !== orderType) setOrderType(nextOrder);

    const nextCurrency = (qp.get("currency") as "all" | TradeCategory) || "all";
    if (nextCurrency !== currencyType) setCurrencyType(nextCurrency);

    const nextRating = (qp.get("rating") as "default" | "highest") || "default";
    if (nextRating !== ratingSort) setRatingSort(nextRating);

    const nextListingType = qp.get("listingItemType") || "all";
    if (nextListingType !== listingTypeFilter) setListingTypeFilter(nextListingType);

    const qpPage = Number(qp.get("page") || routePage || 1) || 1;
    if (qpPage !== page) setPage(qpPage);
  }, [searchParams, routePage]);

  const filteredListings = useMemo(() => {
    const matchesOrder = (listing: MarketplaceListing) => {
      if (orderType === "all") return true;
      if (orderType === "buy") return listing.type === "WTB";
      return listing.type === "WTS";
    };

    const matchesCurrency =
      currencyType === "all" ? () => true : (listing: MarketplaceListing) => listing.currency === currencyType;

    const matchesItemType =
      listingTypeFilter === "all"
        ? () => true
        : (listing: MarketplaceListing) =>
            (listing.item.item_type || "").toLowerCase() === listingTypeFilter.toLowerCase();

    const matchesSearch = (listing: MarketplaceListing) =>
      !searchTerm ||
      listing.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.item.item_type?.toLowerCase().includes(searchTerm.toLowerCase());

    let next = listings
      .filter(matchesOrder)
      .filter(matchesCurrency)
      .filter(matchesItemType)
      .filter(matchesSearch);

    if (ratingSort === "highest") {
      next = [...next].sort((a, b) => b.rating - a.rating);
    }
    return next;
  }, [listings, orderType, currencyType, listingTypeFilter, ratingSort, searchTerm]);

  const sellingListings = filteredListings.filter((l) => l.type === "WTS");
  const buyingListings = filteredListings.filter((l) => l.type === "WTB");

  const toggleRarity = (value: string) => {
    setPage(1);
    const nextVal = value.toLowerCase();
    setRarityFilter((prev) =>
      prev.includes(nextVal) ? prev.filter((r) => r !== nextVal) : [...prev, nextVal]
    );
  };

  const toggleType = (value: string) => {
    setPage(1);
    const nextValue = value.toLowerCase();
    setTypeFilter((prev) =>
      prev.includes(nextValue) ? prev.filter((t) => t !== nextValue) : [...prev, nextValue]
    );
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "value" || key === "rarity" || key === "weight" ? "desc" : "asc");
    }
  };

  const applyValueRange = (nextRange: { min?: number; max?: number }) => {
    setPage(1);
    setValueRange(nextRange);
  };

  const clearValueRange = () => {
    setPage(1);
    setValueRange({});
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setRarityFilter([]);
    setTypeFilter([]);
    setValueRange({});
    setError(null);
    setLoading(false);
    setPage(1);
    const base = isMarketplaceRoute ? "/marketplace" : "/database/items/page/1";
    router.replace(base, { scroll: false });
  };

  const clearParamsCTA = () => {
    resetFilters();
  };

  const ensureEmbarkId = () => {
    if (embarkId) {
      setShowWizard(true);
      setWizardStep(1);
    } else {
      setShowEmbarkModal(true);
    }
  };

  const saveEmbarkId = () => {
    const pattern = /^[A-Za-z0-9._-]{2,20}#\d{4}$/;
    const value = embarkInput.trim();
    if (!pattern.test(value)) {
      setEmbarkError(
        "Use name#1234 format (letters/numbers/._- allowed, 2-20 chars before #, then 4 digits)."
      );
      return;
    }
    setEmbarkId(value);
    setEmbarkError(null);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(EMBARK_ID_KEY, embarkInput.trim());
      }
    } catch {
      // ignore
    }
    setShowEmbarkModal(false);
    setShowWizard(true);
    setWizardStep(1);
  };

  const publishListing = () => {
    if (!wizardState.selectedItem) return;
    if (wizardState.tradeType === "seeds" && !wizardState.pricePerUnit) return;
    if (!wizardState.accepted) return;

    const newListing: MarketplaceListing = {
      id: `user-${Date.now()}`,
      type: wizardState.listingType,
      item: wizardState.selectedItem,
      quantity: wizardState.quantity,
      currency: wizardState.tradeType,
      pricePerUnit: wizardState.tradeType === "seeds" ? wizardState.pricePerUnit : undefined,
      barterFor:
        wizardState.tradeType === "barter"
          ? wizardState.barterLines
              .filter((line) => line.item)
              .map((line) => ({ item: line.item!, quantity: line.quantity }))
          : undefined,
      note: wizardState.description,
      createdAt: new Date().toISOString(),
      rating: 4.6,
      user: {
        username: embarkId || "You",
        avatar: "https://cdn.metaforge.app/arc-raiders/avatars/1.webp",
      },
    };

    setListings((prev) => [newListing, ...prev]);
    setShowWizard(false);
    setWizardState({
      listingType: "WTS",
      tradeType: "seeds",
      quantity: 1,
      barterLines: [{ id: "line-1", quantity: 1 }],
      description: "",
      accepted: false,
    });
    setWizardStep(1);
  };

  const selectItemForWizard = (item: Item) => {
    setWizardState((prev) => ({ ...prev, selectedItem: item }));
  };

  const filteredItemsForWizard = useMemo(() => {
    if (!wizardState.selectedItem) return sortedItems.slice(0, 15);
    return sortedItems;
  }, [sortedItems, wizardState.selectedItem]);

  const selectedSortLabel = (key: SortKey) => {
    const labelMap: Record<SortKey, string> = {
      name: "Name",
      rarity: "Rarity",
      value: "Value",
      weight: "Weight",
      item_type: "Type",
    };
    return labelMap[key];
  };

  return (
    <div className="w-full px-[100px] py-8 space-y-8">
      {welcomeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Welcome</p>
                <h2 className="text-2xl font-semibold text-foreground">Marketplace safety & rules</h2>
              </div>
              <button
                type="button"
                className="rounded-full border border-border p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Close welcome modal"
                onClick={() => setWelcomeOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-secondary/10 p-4">
                <p className="font-semibold text-foreground">Purpose</p>
                <p>Trade safely with fellow Raiders. Listings are user-driven and time-bound.</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/10 p-4">
                <p className="font-semibold text-foreground">Safety tips</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Verify Embark IDs before trading.</li>
                  <li>Never share account credentials.</li>
                  <li>Report suspicious offers immediately.</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/10 p-4">
                <p className="font-semibold text-foreground">How trading works</p>
                <p>Listings lock in after acceptance. Inactivity will pause offers to keep the board fresh.</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-secondary/10 p-4">
                <p className="font-semibold text-foreground">Rules</p>
                <p>Be respectful, stay responsive, and follow in-game marketplace policies.</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
                onClick={() => {
                  setWelcomeOpen(false);
                  try {
                    if (typeof window !== "undefined") {
                      localStorage.setItem(WELCOME_STORAGE_KEY, "true");
                    }
                  } catch {
                    // ignore
                  }
                }}
              >
                Got it, let&apos;s trade!
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmbarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Embark ID</p>
                <h3 className="text-xl font-semibold">Set your Embark ID</h3>
                <p className="text-sm text-muted-foreground">
                  One-time setup. Format must be <span className="font-semibold text-foreground">name#1234</span>. Cannot be
                  edited after saving.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEmbarkModal(false)}
                className="rounded-full border border-border p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Close Embark modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Embark ID
                <input
                  value={embarkInput}
                  onChange={(e) => {
                    setEmbarkInput(e.target.value);
                    if (embarkError) setEmbarkError(null);
                  }}
                  placeholder="Raider#2048"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>
              {embarkError && <p className="text-sm text-red-300">{embarkError}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEmbarkModal(false)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEmbarkId}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
              >
                Save &amp; continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-4xl space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Create listing</p>
                <h3 className="text-xl font-semibold text-foreground">Step {wizardStep} of 3</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="rounded-full border border-border p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Close wizard"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {["Listing type", "Trade details", "Review & terms"].map((label, idx) => (
                <div
                  key={label}
                  className={cn(
                    "rounded-lg border border-border px-3 py-2",
                    wizardStep === idx + 1 ? "bg-primary/10 border-primary text-primary" : "bg-secondary/20 text-muted-foreground"
                  )}
                >
                  <p className="font-semibold">{label}</p>
                </div>
              ))}
            </div>

            {wizardStep === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                {(["WTS", "WTB"] as const).map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setWizardState((prev) => ({ ...prev, listingType: variant }))}
                    className={cn(
                      "rounded-xl border border-border p-4 text-left transition hover:border-primary/60 hover:shadow-lg",
                      wizardState.listingType === variant && "border-primary bg-primary/10 shadow-lg"
                    )}
                  >
                    <p className="text-xs uppercase text-muted-foreground">{variant}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {variant === "WTS" ? "Selling items" : "Buying items"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {variant === "WTS"
                        ? "List your gear and set what you expect in return."
                        : "Post what you need and the payment you can offer."}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  {(["seeds", "barter", "open"] as const).map((trade) => (
                    <button
                      key={trade}
                      type="button"
                      onClick={() =>
                        setWizardState((prev) => ({
                          ...prev,
                          tradeType: trade,
                        }))
                      }
                      className={cn(
                        "rounded-lg border border-border p-3 text-left transition hover:border-primary/60 hover:shadow",
                        wizardState.tradeType === trade && "border-primary bg-primary/10 shadow"
                      )}
                    >
                      <p className="text-xs uppercase text-muted-foreground">
                        {trade === "seeds" ? "Seeds" : trade === "barter" ? "Item for Item" : "Open to Offers"}
                      </p>
                      <p className="text-sm text-foreground">
                        {trade === "seeds"
                          ? "Set a seeds price per item."
                          : trade === "barter"
                          ? "Offer/request specific items."
                          : "No fixed price, negotiate openly."}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-border bg-secondary/5 p-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Item selection</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Choose item</label>
                      <div className="flex flex-wrap gap-2">
                        {filteredItemsForWizard.slice(0, 6).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => selectItemForWizard(item)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-left transition hover:border-primary/60 hover:bg-background",
                              wizardState.selectedItem?.id === item.id && "border-primary bg-primary/10"
                            )}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary/30">
                              {item.icon ? (
                                <img
                                  src={item.icon}
                                  alt=""
                                  className="h-full w-full rounded object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">?</span>
                              )}
                            </div>
                            <span className="text-sm text-foreground">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-xs text-muted-foreground">
                        Quantity
                        <input
                          type="number"
                          min={1}
                          value={wizardState.quantity}
                          onChange={(e) =>
                            setWizardState((prev) => ({
                              ...prev,
                              quantity: Math.max(1, Number(e.target.value) || 1),
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                        />
                      </label>
                      {wizardState.tradeType === "seeds" && (
                        <label className="text-xs text-muted-foreground">
                          Seeds per item
                          <input
                            type="number"
                            min={1}
                            value={wizardState.pricePerUnit ?? ""}
                            onChange={(e) =>
                              setWizardState((prev) => ({
                                ...prev,
                                pricePerUnit: Number(e.target.value) || undefined,
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {wizardState.tradeType === "barter" && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase text-muted-foreground">Barter wants</p>
                      <div className="space-y-2">
                        {wizardState.barterLines.map((line) => (
                          <div
                            key={line.id}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background/60 p-2"
                          >
                            <select
                              value={line.item?.id || ""}
                              onChange={(e) => {
                                const chosen = sortedItems.find((it) => it.id === e.target.value);
                                setWizardState((prev) => ({
                                  ...prev,
                                  barterLines: prev.barterLines.map((b) =>
                                    b.id === line.id ? { ...b, item: chosen } : b
                                  ),
                                }));
                              }}
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                            >
                              <option value="">Select item</option>
                              {sortedItems.slice(0, 20).map((it) => (
                                <option key={it.id} value={it.id}>
                                  {it.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min={1}
                              value={line.quantity}
                              onChange={(e) =>
                                setWizardState((prev) => ({
                                  ...prev,
                                  barterLines: prev.barterLines.map((b) =>
                                    b.id === line.id ? { ...b, quantity: Math.max(1, Number(e.target.value) || 1) } : b
                                  ),
                                }))
                              }
                              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setWizardState((prev) => ({
                                  ...prev,
                                  barterLines: prev.barterLines.filter((b) => b.id !== line.id),
                                }))
                              }
                              className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-secondary"
                              aria-label="Remove barter line"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setWizardState((prev) => ({
                            ...prev,
                            barterLines: [
                              ...prev.barterLines,
                              { id: `line-${prev.barterLines.length + 1}`, quantity: 1 },
                            ],
                          }))
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:bg-secondary"
                      >
                        <CirclePlus className="h-4 w-4" />
                        Add barter item
                      </button>
                    </div>
                  )}

                  <label className="block text-xs text-muted-foreground">
                    Trade description (optional)
                    <textarea
                      value={wizardState.description}
                      onChange={(e) =>
                        setWizardState((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                      placeholder="Share timing, preferred servers, or extra info."
                    />
                  </label>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-secondary/10 p-3">
                  <p className="text-sm font-semibold text-foreground">Review</p>
                  <p className="text-sm text-muted-foreground">
                    {wizardState.listingType} {wizardState.quantity}x {wizardState.selectedItem?.name || "item"} using{" "}
                    {wizardState.tradeType === "seeds"
                      ? `${wizardState.pricePerUnit || 0} seeds each`
                      : wizardState.tradeType === "barter"
                      ? "barter requirements"
                      : "open offers"}.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/10 p-3 space-y-2 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Rules & timers</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Listings pause after 48h inactivity.</li>
                    <li>Accepted offers are locked for 2h to prevent sniping.</li>
                    <li>All trades must follow in-game ToS and community guidelines.</li>
                    <li>Misconduct or scams lead to suspension.</li>
                  </ul>
                </div>
                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={wizardState.accepted}
                    onChange={(e) =>
                      setWizardState((prev) => ({
                        ...prev,
                        accepted: e.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>
                    I understand the inactivity rules, lock-in behavior, review timers, and marketplace disclaimers.
                  </span>
                </label>
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setWizardStep((prev) => Math.max(1, prev - 1))}
                disabled={wizardStep === 1}
                className={cn(
                  "rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary",
                  wizardStep === 1 && "cursor-not-allowed opacity-60"
                )}
              >
                Back
              </button>
              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((prev) => Math.min(3, prev + 1))}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
                  disabled={wizardStep === 2 && !wizardState.selectedItem}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={publishListing}
                  disabled={
                    !wizardState.selectedItem ||
                    (wizardState.tradeType === "seeds" && !wizardState.pricePerUnit) ||
                    !wizardState.accepted
                  }
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90",
                    (!wizardState.selectedItem ||
                      (wizardState.tradeType === "seeds" && !wizardState.pricePerUnit) ||
                      !wizardState.accepted) &&
                      "cursor-not-allowed opacity-60"
                  )}
                >
                  Publish listing
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-transparent to-secondary/20 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Marketplace</p>
            <h1 className="font-display text-3xl font-bold text-foreground">Marketplace</h1>
            <p className="text-sm text-muted-foreground">Arc Raiders &gt; Market</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-border bg-card/70 px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
          >
            <Star className="h-4 w-4" />
            Add to favorites
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search items and listings..."
              className="w-full rounded-lg border border-border bg-background px-10 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
              aria-label="Search items"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/listings"
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary"
            >
              My Listings
            </Link>
            {!isMarketplaceRoute && (
              <Link
                href="/trades"
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary"
              >
                My Trades
              </Link>
            )}
            <Link
              href="/messages"
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary"
            >
              My Messages
            </Link>
            <button
              type="button"
              onClick={ensureEmbarkId}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
            >
              <CirclePlus className="h-4 w-4" />
              Create Listing
            </button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Page header area appears below the top cards when the Items card is active.
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="text-xs text-muted-foreground">
            Order Type
            <select
              value={orderType}
              onChange={(e) => {
                setOrderType(e.target.value as "all" | "buy" | "sell");
                setVisibleBuy(4);
                setVisibleSell(4);
              }}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All</option>
              <option value="sell">Sell (WTS)</option>
              <option value="buy">Buy (WTB)</option>
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Currency Type
            <select
              value={currencyType}
              onChange={(e) => setCurrencyType(e.target.value as "all" | TradeCategory)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All</option>
              <option value="seeds">Seeds</option>
              <option value="barter">Barter</option>
              <option value="open">Open to Offers</option>
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Rating
            <select
              value={ratingSort}
              onChange={(e) => setRatingSort(e.target.value as "default" | "highest")}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="default">Default</option>
              <option value="highest">Highest</option>
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            Item Type
            <select
              value={listingTypeFilter}
              onChange={(e) => setListingTypeFilter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {orderType === "buy" ? "Buying (WTB)" : "Selling (WTS)"}
            </h3>
          </div>
          {((orderType === "sell" ? filteredListings : sellingListings).slice(0, visibleSell)).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
          {(orderType === "sell" ? filteredListings : sellingListings).length === 0 && (
            <div className="rounded-lg border border-border bg-card/70 p-4 text-center text-sm text-muted-foreground">
              No selling listings match these filters.
            </div>
          )}
          <button
            type="button"
            onClick={() => setVisibleSell((prev) => prev + 4)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={(orderType === "sell" ? filteredListings : sellingListings).length <= visibleSell}
          >
            Load more
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {orderType === "sell" ? "Selling (WTS)" : "Buying (WTB)"}
            </h3>
          </div>
          {((orderType === "buy" ? filteredListings : buyingListings).slice(0, visibleBuy)).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
          {(orderType === "buy" ? filteredListings : buyingListings).length === 0 && (
            <div className="rounded-lg border border-border bg-card/70 p-4 text-center text-sm text-muted-foreground">
              No buying listings match these filters.
            </div>
          )}
          <button
            type="button"
            onClick={() => setVisibleBuy((prev) => prev + 4)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={(orderType === "buy" ? filteredListings : buyingListings).length <= visibleBuy}
          >
            Load more
          </button>
        </div>
      </div>

      {!isMarketplaceRoute && (
        <div className="space-y-3 rounded-xl border border-border bg-card/70 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Items database</p>
            <h3 className="text-xl font-semibold text-foreground">All items</h3>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <div className="min-w-[960px]">
            <div className="grid grid-cols-[1.4fr_2fr_1fr_1fr_1fr_1.2fr] bg-secondary/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {([
              { key: "name", label: "Name" },
              { key: "description", label: "Description", sortable: false },
              { key: "rarity", label: "Rarity", filter: "rarity" },
              { key: "value", label: "Value", filter: "value" },
              { key: "weight", label: "Weight" },
              { key: "item_type", label: "Type", filter: "type" },
            ] as const).map((col) => (
              <div key={col.key} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => col.key !== "description" && toggleSort(col.key as SortKey)}
                  className={cn(
                    "flex items-center gap-1 text-left",
                    col.key !== "description" ? "cursor-pointer hover:text-foreground" : "cursor-default"
                  )}
                  aria-label={`Sort by ${selectedSortLabel(col.key as SortKey)}`}
                >
                  <span className="truncate">{col.label}</span>
                  {col.key !== "description" && (
                    <ArrowDownUp
                      className={cn(
                        "h-3.5 w-3.5 transition",
                        sortKey === col.key && sortDir === "desc" && "rotate-180 text-foreground",
                        sortKey === col.key && sortDir === "asc" && "text-foreground"
                      )}
                    />
                  )}
                </button>
                {col.filter === "rarity" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1 rounded p-1 transition",
                          rarityFilter.length > 0 ? "bg-secondary text-foreground" : "hover:bg-secondary"
                        )}
                        aria-label="Filter by rarity"
                      >
                        <Filter className="h-3.5 w-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-56 space-y-2 border-border bg-card p-3 text-sm shadow-xl">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <span>Rarity</span>
                      </div>
                      {["common", "uncommon", "rare", "epic", "legendary"].map((rarity) => (
                        <label
                          key={rarity}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-foreground hover:bg-secondary/30"
                        >
                          <input
                            type="checkbox"
                            checked={rarityFilter.includes(rarity)}
                            onChange={() => toggleRarity(rarity)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="capitalize">{rarity}</span>
                        </label>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}
                {col.filter === "value" && (
                  <ValueRangePopover
                    value={valueRange}
                    onApply={applyValueRange}
                    onClear={clearValueRange}
                    isActive={valueRange.min !== undefined || valueRange.max !== undefined}
                  />
                )}
                {col.filter === "type" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1 rounded p-1 transition",
                          typeFilter.length > 0 ? "bg-secondary text-foreground" : "hover:bg-secondary"
                        )}
                        aria-label="Filter by type"
                      >
                        <Filter className="h-3.5 w-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-64 space-y-2 border-border bg-card p-3 text-sm shadow-xl">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <span>Type</span>
                      </div>
                      {typeOptions.map((type) => (
                        <label
                          key={type}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-foreground hover:bg-secondary/30"
                        >
                          <input
                            type="checkbox"
                            checked={typeFilter.includes(type.toLowerCase())}
                            onChange={() => toggleType(type)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            ))}
          </div>

            <div className="divide-y divide-border/70">
            {loading &&
              Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="grid grid-cols-[1.4fr_2fr_1fr_1fr_1fr_1.2fr] items-center gap-3 px-3 py-3 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-secondary/50" />
                    <div className="h-4 w-24 rounded bg-secondary/40" />
                  </div>
                  <div className="h-4 w-32 rounded bg-secondary/40" />
                  <div className="h-6 w-16 rounded bg-secondary/40" />
                  <div className="h-4 w-12 rounded bg-secondary/40" />
                  <div className="h-4 w-10 rounded bg-secondary/40" />
                  <div className="h-4 w-24 rounded bg-secondary/40" />
                </div>
              ))}

            {!loading &&
              !error &&
              pagedItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1.4fr_2fr_1fr_1fr_1fr_1.2fr] items-center gap-3 px-3 py-3 hover:bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/items/${item.id}`}
                      className="flex items-center gap-3 text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary/40">
                        {item.icon ? (
                          <img
                            src={item.icon}
                            alt={item.name}
                            className="h-10 w-10 rounded object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">?</span>
                        )}
                      </div>
                      <span className="font-medium line-clamp-1">{item.name}</span>
                    </Link>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{item.description || "-"}</div>
                  <div>
                    <span className="rounded px-2 py-1 text-xs font-semibold uppercase" style={{ backgroundColor: "hsl(0 0% 18% / 0.6)" }}>
                      {item.rarity || "Common"}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-primary">{item.value ?? 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.stat_block?.weight ?? (item as any).weight ?? "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">{item.item_type || "-"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!loading && !error && sortedItems.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/70 bg-secondary/10 p-6 text-center">
            <p className="text-foreground">No items found</p>
            <p className="text-sm text-muted-foreground">
              Try another search or clear filters to see all items.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200">
            <p className="font-semibold">Error loading items</p>
            <p className="text-red-100">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchItems({ page: 1, pageSize: 500 })
                  .then((res) => {
                    const data = Array.isArray(res.data) ? res.data : [];
                    const dataset = data.length ? data : localItems;
                    setAllItems(dataset);
                    if (!typeOptions.length) {
                      const uniqueTypes = Array.from(
                        new Set(dataset.map((item) => item.item_type).filter(Boolean) as string[])
                      ).sort();
                      setTypeOptions(uniqueTypes);
                    }
                  })
                  .catch(() => setError("Failed to load items. Please try again."))
                  .finally(() => setLoading(false));
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:bg-secondary"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Retry
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing page {page} of {totalPages}. Sort by {selectedSortLabel(sortKey)} ({sortDir}).
          </p>
          <PaginationControl
            current={page}
            total={totalPages}
            onPageChange={(next) => {
              const target = Math.min(Math.max(next, 1), totalPages);
              setPage(target);
            }}
          />
        </div>
      </div>
      )}
    </div>
  );
}
