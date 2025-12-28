'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowDownUp, Search } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";

type SortField = "name" | "lootCount";
type SortDirection = "asc" | "desc";

type ArcLoot = {
  id: string;
  item: {
    id: string;
    name: string;
    icon: string | null;
    rarity: string | null;
    item_type: string | null;
  };
};

type Arc = {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  image: string | null;
  loot: ArcLoot[];
};

const rarityStyles: Record<string, { bg: string; color: string }> = {
  COMMON: { bg: "hsl(0 0% 18% / 0.6)", color: "hsl(0 0% 60%)" },
  UNCOMMON: { bg: "hsl(120 40% 50% / 0.2)", color: "hsl(120 40% 50%)" },
  RARE: { bg: "hsl(210 80% 55% / 0.2)", color: "hsl(210 80% 55%)" },
  EPIC: { bg: "hsl(270 70% 60% / 0.2)", color: "hsl(270 70% 60%)" },
  LEGENDARY: { bg: "hsl(40 95% 55% / 0.2)", color: "hsl(40 95% 55%)" },
};

export function ArcsDataTable() {
  const searchParams = useSearchParams();
  const [allData, setAllData] = useState<Arc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const pageSize = 12;

  // Fetch all ARCs from API
  useEffect(() => {
    const fetchAllArcs = async () => {
      setLoading(true);
      try {
        // Fetch with a large page size to get all ARCs
        const response = await fetch('/api/arcs?pageSize=10000');
        const result = await response.json();

        if (result.success) {
          setAllData(result.data);
        }
      } catch (error) {
        console.error('Error fetching ARCs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllArcs();
  }, []);

  // Filter and sort data
  const filtered = useMemo(() => {
    let next = allData;

    if (search) {
      const q = search.toLowerCase();
      next = next.filter((arc) => arc.name.toLowerCase().includes(q));
    }

    const sorted = [...next].sort((a, b) => {
      switch (sortField) {
        case "lootCount": {
          const left = a.loot.length;
          const right = b.loot.length;
          return sortDir === "asc" ? left - right : right - left;
        }
        case "name":
        default:
          return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
    });

    return sorted;
  }, [allData, search, sortField, sortDir]);

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

  return (
    <div className="w-full space-y-6" dir="ltr">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          placeholder="ابحث عن وحدات ARC..."
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
                  <button
                    type="button"
                    onClick={() => updateSort("lootCount")}
                    className="flex items-center gap-1 font-medium transition hover:text-foreground"
                  >
                    عدد المواد
                    <ArrowDownUp className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-3 py-2 text-left">أهم المواد</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                    جاري التحميل...
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((arc) => (
                  <tr
                    key={arc.id}
                    className="border-b border-border/60 transition hover:bg-secondary/30"
                  >
                    <td className="px-3 py-3">
                      <Link href={`/arcs/${arc.id}`} className="flex items-center gap-3 text-foreground transition hover:text-primary">
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-secondary">
                          {arc.icon ? (
                            <Image src={arc.icon} alt="" width={48} height={48} className="h-12 w-12 rounded object-contain" />
                          ) : (
                            <span className="text-xs text-muted-foreground">?</span>
                          )}
                        </div>
                        <span className="font-medium text-lg">{arc.name}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <p className="line-clamp-2 text-xs sm:text-sm max-w-2xl">{arc.description || "-"}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-medium">{arc.loot.length}</span>
                    </td>
                    <td className="px-3 py-3">
                      {arc.loot.length > 0 ? (
                        <div className="flex gap-2">
                          {arc.loot.slice(0, 3).map((lootItem) => (
                            <div
                              key={lootItem.id}
                              className="relative w-8 h-8 bg-muted rounded overflow-hidden"
                              title={lootItem.item.name}
                            >
                              {lootItem.item.icon ? (
                                <Image
                                  src={lootItem.item.icon}
                                  alt={lootItem.item.name}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                  ?
                                </div>
                              )}
                            </div>
                          ))}
                          {arc.loot.length > 3 && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              +{arc.loot.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">لا توجد مواد</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                    لا توجد وحدات ARC. حاول تعديل البحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination basePath="/arcs" currentPage={safePage} totalPages={totalPages} className="pt-2" />
    </div>
  );
}
