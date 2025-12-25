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
import { Plus, Filter, Search, ArrowDownUp, Trash2, Edit, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { CreateListingDialog } from "./CreateListingDialog";
import { ListingCard } from "./ListingCard";
import { cn } from "@/lib/utils";
import type { Listing } from "./Marketplace";

interface MyListingsProps {
  session: Session | null;
  userProfile: {
    discord_username: string | null;
    embark_id: string | null;
  } | null;
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

export function MyListings({ session, userProfile }: MyListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "WTS" | "WTB">("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const fetchMyListings = async () => {
    try {
      const response = await fetch("/api/marketplace/listings");
      const data = await response.json();
      // Filter only user's listings
      const userListings = (data.listings || []).filter(
        (listing: Listing) => listing.user.id === session?.user?.id
      );
      setListings(userListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
    setStatusFilter("all");
    setTypeFilter("all");
    setPaymentFilter("all");
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

      // Status filter
      if (statusFilter !== "all" && listing.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && listing.type !== typeFilter) {
        return false;
      }

      // Payment filter
      if (paymentFilter !== "all" && listing.paymentType !== paymentFilter) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered = sortListings(filtered, sortKey, sortDir);

    return filtered;
  }, [listings, searchTerm, statusFilter, typeFilter, paymentFilter, sortKey, sortDir]);

  const wtsListings = filteredAndSortedListings.filter((listing) => listing.type === "WTS");
  const wtbListings = filteredAndSortedListings.filter((listing) => listing.type === "WTB");

  const handleListingCreated = () => {
    fetchMyListings();
    setCreateDialogOpen(false);
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه القائمة؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMyListings();
      } else {
        alert("فشل حذف القائمة");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("حدث خطأ أثناء حذف القائمة");
    }
  };

  const handleToggleStatus = async (listingId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const response = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchMyListings();
      } else {
        alert("فشل تحديث حالة القائمة");
      }
    } catch (error) {
      console.error("Error updating listing status:", error);
      alert("حدث خطأ أثناء تحديث الحالة");
    }
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{listings.length}</p>
              <p className="text-sm text-muted-foreground">إجمالي القوائم</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{wtsListings.length}</p>
              <p className="text-sm text-muted-foreground">للبيع (WTS)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{wtbListings.length}</p>
              <p className="text-sm text-muted-foreground">للشراء (WTB)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">
                {listings.filter((l) => l.status === "ACTIVE").length}
              </p>
              <p className="text-sm text-muted-foreground">نشط</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Create Listing */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث في قوائمك..."
              className="w-full rounded-lg border border-border bg-background px-10 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
              aria-label="Search my listings"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {session?.user && (
              <Button
                onClick={() => setCreateDialogOpen(true)}
                disabled={needsProfileSetup}
                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4 ml-2" />
                إنشاء قائمة جديدة
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9 bg-card/50 border-border/50">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="ACTIVE">نشط</SelectItem>
              <SelectItem value="INACTIVE">غير نشط</SelectItem>
              <SelectItem value="COMPLETED">مكتمل</SelectItem>
              <SelectItem value="CANCELLED">ملغي</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as "all" | "WTS" | "WTB")}>
            <SelectTrigger className="w-[150px] h-9 bg-card/50 border-border/50">
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="WTS">للبيع (WTS)</SelectItem>
              <SelectItem value="WTB">للشراء (WTB)</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Type Filter */}
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
          {(searchTerm || statusFilter !== "all" || typeFilter !== "all" || paymentFilter !== "all") && (
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

      {/* Listings Grid */}
      {filteredAndSortedListings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-lg font-semibold text-foreground mb-2">لا توجد قوائم</p>
          <p className="text-sm text-muted-foreground mb-6">
            {listings.length === 0
              ? "لم تقم بإنشاء أي قوائم بعد. ابدأ بإنشاء قائمة جديدة!"
              : "لا توجد قوائم تطابق هذه الفلاتر"}
          </p>
          {listings.length === 0 && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              disabled={needsProfileSetup}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 ml-2" />
              إنشاء قائمة الآن
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAndSortedListings.map((listing) => (
            <div key={listing.id} className="relative">
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                    listing.status === "ACTIVE" && "bg-green-500/20 text-green-400",
                    listing.status === "INACTIVE" && "bg-gray-500/20 text-gray-400",
                    listing.status === "COMPLETED" && "bg-blue-500/20 text-blue-400",
                    listing.status === "CANCELLED" && "bg-red-500/20 text-red-400"
                  )}
                >
                  {listing.status === "ACTIVE" && "نشط"}
                  {listing.status === "INACTIVE" && "غير نشط"}
                  {listing.status === "COMPLETED" && "مكتمل"}
                  {listing.status === "CANCELLED" && "ملغي"}
                </span>
              </div>

              <ListingCard
                listing={listing}
                currentUserId={session?.user?.id}
                userProfile={userProfile}
                onUpdate={fetchMyListings}
              />

              {/* Action Buttons */}
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(listing.id, listing.status)}
                  className="flex-1"
                >
                  {listing.status === "ACTIVE" ? (
                    <>
                      <EyeOff className="h-4 w-4 ml-2" />
                      إيقاف
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 ml-2" />
                      تفعيل
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteListing(listing.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
