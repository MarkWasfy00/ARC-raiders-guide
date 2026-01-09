"use client";

import { useEffect, useState, useMemo } from "react";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, AlertCircle, Filter, Search, ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CreateListingDialog } from "./CreateListingDialog";
import { ListingCard } from "./ListingCard";
import { cn } from "@/lib/utils";

interface MarketplaceProps {
  session: Session | null;
  userProfile: {
    discord_username: string | null;
    embark_id: string | null;
  } | null;
}

export interface Listing {
  id: string;
  type: "WTS" | "WTB";
  status: string;
  quantity: number;
  paymentType: "SEEDS" | "ITEMS" | "OPEN_OFFERS";
  seedsAmount: number | null;
  description: string;
  created_at: string;
  item: {
    id: string;
    name: string;
    icon: string | null;
    rarity: string | null;
    item_type: string | null;
  };
  user: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
    embark_id: string | null;
    discord_username: string | null;
    createdAt: string;
    averageRating: number;
    totalRatings: number;
    honestTradesCount: number;
  };
  paymentItems: Array<{
    id: string;
    quantity: number;
    item: {
      id: string;
      name: string;
      icon: string | null;
      rarity: string | null;
    };
  }>;
}

type SortKey = "name" | "rarity" | "quantity" | "created_at";
type SortDir = "asc" | "desc";

const rarityOrder: Record<string, number> = {
  LEGENDARY: 5,
  EPIC: 4,
  RARE: 3,
  UNCOMMON: 2,
  COMMON: 1,
};

export function Marketplace({ session, userProfile }: MarketplaceProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states (multi-select for rarity and item type)
  const [rarityFilter, setRarityFilter] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [itemTypeFilter, setItemTypeFilter] = useState<string[]>([]);
  const [orderTypeFilter, setOrderTypeFilter] = useState<"all" | "WTS" | "WTB">("all");
  const [ratingSort, setRatingSort] = useState<"default" | "highest">("default");

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination state
  const [page, setPage] = useState(1);
  const [visibleWTS, setVisibleWTS] = useState(4);
  const [visibleWTB, setVisibleWTB] = useState(4);
  const itemsPerPage = 10;

  const fetchListings = async () => {
    try {
      const response = await fetch("/api/marketplace/listings");
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Get unique item types for filter
  const itemTypes = useMemo(() => {
    const types = new Set(listings.map((l) => l.item.item_type).filter((t): t is string => Boolean(t)));
    return Array.from(types).sort();
  }, [listings]);

  // Sorting function
  const sortListings = (data: Listing[], key: SortKey, dir: SortDir) => {
    const sorted = [...data].sort((a, b) => {
      if (key === "rarity") {
        const left = rarityOrder[a.item.rarity || "COMMON"] || 0;
        const right = rarityOrder[b.item.rarity || "COMMON"] || 0;
        return dir === "asc" ? left - right : right - left;
      }
      if (key === "quantity") {
        return dir === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity;
      }
      if (key === "created_at") {
        const left = new Date(a.created_at).getTime();
        const right = new Date(b.created_at).getTime();
        return dir === "asc" ? left - right : right - left;
      }
      if (key === "name") {
        return dir === "asc"
          ? a.item.name.localeCompare(b.item.name)
          : b.item.name.localeCompare(a.item.name);
      }
      return 0;
    });
    return sorted;
  };

  // Toggle filter helpers
  const toggleRarity = (value: string) => {
    setPage(1);
    setRarityFilter((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    );
  };

  const toggleItemType = (value: string) => {
    setPage(1);
    setItemTypeFilter((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "created_at" || key === "rarity" || key === "quantity" ? "desc" : "asc");
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setRarityFilter([]);
    setPaymentFilter("all");
    setItemTypeFilter([]);
    setOrderTypeFilter("all");
    setRatingSort("default");
    setPage(1);
  };

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    let filtered = listings.filter((listing) => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !listing.item.name.toLowerCase().includes(term) &&
          !listing.item.item_type?.toLowerCase().includes(term) &&
          !listing.description.toLowerCase().includes(term)
        ) {
          return false;
        }
      }

      // Rarity filter (multi-select)
      if (rarityFilter.length > 0 && !rarityFilter.includes(listing.item.rarity || "")) {
        return false;
      }

      // Payment filter
      if (paymentFilter !== "all" && listing.paymentType !== paymentFilter) {
        return false;
      }

      // Item type filter (multi-select)
      if (itemTypeFilter.length > 0 && !itemTypeFilter.includes(listing.item.item_type || "")) {
        return false;
      }

      // Order type filter
      if (orderTypeFilter !== "all" && listing.type !== orderTypeFilter) {
        return false;
      }

      return true;
    });

    // Sort by rating if needed
    if (ratingSort === "highest") {
      filtered = [...filtered].sort((a, b) => b.user.averageRating - a.user.averageRating);
    } else {
      // Apply regular sorting
      filtered = sortListings(filtered, sortKey, sortDir);
    }

    return filtered;
  }, [listings, searchTerm, rarityFilter, paymentFilter, itemTypeFilter, orderTypeFilter, sortKey, sortDir, ratingSort]);

  const wtsListings = filteredAndSortedListings.filter((listing) => listing.type === "WTS");
  const wtbListings = filteredAndSortedListings.filter((listing) => listing.type === "WTB");

  const handleListingCreated = async () => {
    // Refresh the listings to show the newly created one
    await fetchListings();
    // Reset pagination to show the new listing at the top
    setVisibleWTS(4);
    setVisibleWTB(4);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  const needsProfileSetup = session?.user && (!userProfile?.discord_username || !userProfile?.embark_id);

  return (
    <div className="space-y-6">
      {needsProfileSetup && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-red-600 dark:text-red-500">
                  يجب إكمال ملفك الشخصي
                </h3>
                <p className="text-sm text-red-600 dark:text-red-500">
                  يجب إضافة معرف Discord و Embark ID في{" "}
                  <Link href="/profile" className="underline font-bold">
                    ملفك الشخصي
                  </Link>{" "}
                  قبل إنشاء قائمة في السوق.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Create Listing */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث في العناصر والقوائم..."
              className="w-full rounded-lg border border-border bg-background px-10 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
              aria-label="Search items"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {session?.user && (
              <>
                <Link
                  href="/listings"
                  className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary"
                >
                  قوائمي
                </Link>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  disabled={needsProfileSetup}
                  className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء قائمة
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Rarity Filter with Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded border border-border px-3 py-2 text-xs font-medium uppercase tracking-wide transition",
                  rarityFilter.length > 0 ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                الندرة
                <Filter className="h-4 w-4" />
                {rarityFilter.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {rarityFilter.length}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 space-y-2 border-border bg-card p-3 text-sm shadow-xl">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>الندرة</span>
              </div>
              {["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"].map((rarity) => (
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
                  <span className="capitalize">
                    {rarity === "COMMON" && "عادي"}
                    {rarity === "UNCOMMON" && "غير عادي"}
                    {rarity === "RARE" && "نادر"}
                    {rarity === "EPIC" && "ملحمي"}
                    {rarity === "LEGENDARY" && "أسطوري"}
                  </span>
                </label>
              ))}
            </PopoverContent>
          </Popover>

          {/* Item Type Filter with Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded border border-border px-3 py-2 text-xs font-medium uppercase tracking-wide transition",
                  itemTypeFilter.length > 0 ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                النوع
                <Filter className="h-4 w-4" />
                {itemTypeFilter.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {itemTypeFilter.length}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 space-y-2 border-border bg-card p-3 text-sm shadow-xl">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>نوع العنصر</span>
              </div>
              {itemTypes.map((type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-foreground hover:bg-secondary/30"
                >
                  <input
                    type="checkbox"
                    checked={itemTypeFilter.includes(type)}
                    onChange={() => toggleItemType(type)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </PopoverContent>
          </Popover>

          {/* Payment Type Dropdown */}
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[150px] h-9 bg-card/50 border-border/50">
              <SelectValue placeholder="الدفع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الطرق</SelectItem>
              <SelectItem value="SEEDS">بذور</SelectItem>
              <SelectItem value="ITEMS">عناصر</SelectItem>
              <SelectItem value="OPEN_OFFERS">عروض مفتوحة</SelectItem>
            </SelectContent>
          </Select>

          {/* Order Type Dropdown */}
          <Select value={orderTypeFilter} onValueChange={(v) => setOrderTypeFilter(v as "all" | "WTS" | "WTB")}>
            <SelectTrigger className="w-[150px] h-9 bg-card/50 border-border/50">
              <SelectValue placeholder="نوع الطلب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="WTS">للبيع (WTS)</SelectItem>
              <SelectItem value="WTB">للشراء (WTB)</SelectItem>
            </SelectContent>
          </Select>

          {/* Rating Sort */}
          <Select value={ratingSort} onValueChange={(v) => setRatingSort(v as "default" | "highest")}>
            <SelectTrigger className="w-[150px] h-9 bg-card/50 border-border/50">
              <SelectValue placeholder="التقييم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">افتراضي</SelectItem>
              <SelectItem value="highest">الأعلى تقييماً</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Button */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded border border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground transition hover:bg-secondary"
              >
                ترتيب
                <ArrowDownUp className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 space-y-2 border-border bg-card p-3 text-sm shadow-xl">
              {[
                { key: "created_at" as SortKey, label: "التاريخ" },
                { key: "name" as SortKey, label: "الاسم" },
                { key: "rarity" as SortKey, label: "الندرة" },
                { key: "quantity" as SortKey, label: "الكمية" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleSort(option.key)}
                  className={cn(
                    "flex w-full items-center justify-between rounded px-2 py-1 text-right transition hover:bg-secondary/30",
                    sortKey === option.key && "bg-secondary text-foreground"
                  )}
                >
                  <span>{option.label}</span>
                  {sortKey === option.key && (
                    <ArrowDownUp className={cn("h-4 w-4 transition", sortDir === "desc" && "rotate-180")} />
                  )}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Reset Filters */}
          {(searchTerm || rarityFilter.length > 0 || paymentFilter !== "all" || itemTypeFilter.length > 0 || orderTypeFilter !== "all" || ratingSort !== "default") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 text-xs"
            >
              إعادة تعيين الكل
            </Button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WTS (Want to Sell) Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {orderTypeFilter === "WTB" ? "للشراء (WTB)" : "للبيع (WTS)"}
            </h3>
            <span className="text-sm text-muted-foreground">
              {orderTypeFilter === "WTB" ? wtbListings.length : wtsListings.length} عرض
            </span>
          </div>
          {(orderTypeFilter === "WTB" ? wtbListings : wtsListings).length === 0 ? (
            <div className="rounded-lg border border-border bg-card/70 p-4 text-center text-sm text-muted-foreground">
              لا توجد عروض تطابق هذه الفلاتر
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {(orderTypeFilter === "WTB" ? wtbListings : wtsListings).slice(0, orderTypeFilter === "WTB" ? visibleWTB : visibleWTS).map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    currentUserId={session?.user?.id}
                    userProfile={userProfile}
                    onUpdate={fetchListings}
                  />
                ))}
              </div>
              {(orderTypeFilter === "WTB" ? wtbListings : wtsListings).length > (orderTypeFilter === "WTB" ? visibleWTB : visibleWTS) && (
                <button
                  type="button"
                  onClick={() => orderTypeFilter === "WTB" ? setVisibleWTB((prev) => prev + 4) : setVisibleWTS((prev) => prev + 4)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary"
                >
                  تحميل المزيد
                </button>
              )}
            </>
          )}
        </div>

        {/* WTB (Want to Buy) Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {orderTypeFilter === "WTS" ? "للبيع (WTS)" : "للشراء (WTB)"}
            </h3>
            <span className="text-sm text-muted-foreground">
              {orderTypeFilter === "WTS" ? wtsListings.length : wtbListings.length} طلب
            </span>
          </div>
          {(orderTypeFilter === "WTS" ? wtsListings : wtbListings).length === 0 ? (
            <div className="rounded-lg border border-border bg-card/70 p-4 text-center text-sm text-muted-foreground">
              لا توجد طلبات تطابق هذه الفلاتر
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {(orderTypeFilter === "WTS" ? wtsListings : wtbListings).slice(0, orderTypeFilter === "WTS" ? visibleWTS : visibleWTB).map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    currentUserId={session?.user?.id}
                    userProfile={userProfile}
                    onUpdate={fetchListings}
                  />
                ))}
              </div>
              {(orderTypeFilter === "WTS" ? wtsListings : wtbListings).length > (orderTypeFilter === "WTS" ? visibleWTS : visibleWTB) && (
                <button
                  type="button"
                  onClick={() => orderTypeFilter === "WTS" ? setVisibleWTS((prev) => prev + 4) : setVisibleWTB((prev) => prev + 4)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary"
                >
                  تحميل المزيد
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {session?.user && (
        <CreateListingDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleListingCreated}
        />
      )}
    </div>
  );
}
