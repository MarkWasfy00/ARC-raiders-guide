'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowDownUp, Search, Trophy, Target } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";

type SortField = "name" | "xp" | "rewardsCount";
type SortDirection = "asc" | "desc";

type QuestReward = {
  id: string;
  quantity: number;
  itemId: string;
};

type Quest = {
  id: string;
  name: string;
  objectives: string[];
  xp: number;
  granted_items: any;
  locations: any;
  marker_category: string | null;
  image: string | null;
  guide_links: any;
  required_items: any;
  rewards: QuestReward[];
};

export function QuestsDataTable() {
  const searchParams = useSearchParams();
  const [allData, setAllData] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const pageSize = 12;

  // Fetch all quests from API
  useEffect(() => {
    const fetchAllQuests = async () => {
      setLoading(true);
      try {
        // Fetch with a large page size to get all quests
        const response = await fetch('/api/quests?pageSize=10000');
        const result = await response.json();

        if (result.success) {
          setAllData(result.data);
        }
      } catch (error) {
        console.error('Error fetching quests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuests();
  }, []);

  // Filter and sort data
  const filtered = useMemo(() => {
    let next = allData;

    if (search) {
      const q = search.toLowerCase();
      next = next.filter((quest) => quest.name.toLowerCase().includes(q));
    }

    const sorted = [...next].sort((a, b) => {
      switch (sortField) {
        case "xp": {
          return sortDir === "asc" ? a.xp - b.xp : b.xp - a.xp;
        }
        case "rewardsCount": {
          const left = a.rewards.length;
          const right = b.rewards.length;
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
          placeholder="ابحث عن المهام..."
          className="w-full rounded-lg border border-border bg-card px-10 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">الصورة</th>
                <th className="px-3 py-2 text-left">
                  <button
                    type="button"
                    onClick={() => updateSort("name")}
                    className="flex items-center gap-1 font-medium transition hover:text-foreground"
                  >
                    اسم المهمة
                    <ArrowDownUp className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-3 py-2 text-left">الأهداف</th>
                <th className="px-3 py-2 text-left">
                  <button
                    type="button"
                    onClick={() => updateSort("xp")}
                    className="flex items-center gap-1 font-medium transition hover:text-foreground"
                  >
                    الخبرة
                    <ArrowDownUp className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-3 py-2 text-left">
                  <button
                    type="button"
                    onClick={() => updateSort("rewardsCount")}
                    className="flex items-center gap-1 font-medium transition hover:text-foreground"
                  >
                    المكافآت
                    <ArrowDownUp className="h-3.5 w-3.5" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    جاري التحميل...
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((quest) => (
                  <tr
                    key={quest.id}
                    className="border-b border-border/60 transition hover:bg-secondary/30"
                  >
                    <td className="px-3 py-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded bg-secondary">
                        {quest.image ? (
                          <Image src={quest.image} alt="" width={64} height={64} className="h-16 w-16 rounded object-cover" />
                        ) : (
                          <Target className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/quests/${quest.id}`} className="font-medium text-lg text-foreground transition hover:text-primary">
                        {quest.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {quest.objectives.length > 0 ? (
                        <div className="max-w-xl">
                          <p className="text-sm line-clamp-2">
                            {quest.objectives[0]}
                            {quest.objectives.length > 1 && (
                              <span className="text-xs mr-1">
                                {' '}(+{quest.objectives.length - 1} المزيد)
                              </span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm">لا توجد أهداف</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-amber-500 font-medium">
                        <Trophy className="w-4 h-4" />
                        {quest.xp.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {quest.rewards.length > 0 ? (
                        <span className="font-medium text-green-500">{quest.rewards.length} مكافأة</span>
                      ) : (
                        <span className="text-muted-foreground">لا توجد</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    لا توجد مهام. حاول تعديل البحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination basePath="/quests" currentPage={safePage} totalPages={totalPages} className="pt-2" />
    </div>
  );
}
