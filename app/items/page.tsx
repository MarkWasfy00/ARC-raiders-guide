'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ArrowDownUp, Filter, Search, Star } from "lucide-react";
import { items } from "@/lib/database";
import { Pagination } from "@/components/common/Pagination";

const rarityOrder: Record<string, number> = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };

type SortField = "name" | "rarity" | "value" | "type";
type SortDirection = "asc" | "desc";

export default function ItemsPage() {
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [valueRange, setValueRange] = useState<{ min?: number; max?: number }>({});
  const [valueDraft, setValueDraft] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  const types = useMemo(() => {
    const set = new Set(items.map((i) => i.item_type).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, []);

  const rarities = ["common", "uncommon", "rare", "epic", "legendary"];
  const pageSize = 12;
  const rarityStyles: Record<string, { bg: string; color: string }> = {
    common: { bg: "hsl(0 0% 18% / 0.6)", color: "hsl(0 0% 60%)" },
    uncommon: { bg: "hsl(120 40% 50% / 0.2)", color: "hsl(120 40% 50%)" },
    rare: { bg: "hsl(210 80% 55% / 0.2)", color: "hsl(210 80% 55%)" },
    epic: { bg: "hsl(270 70% 60% / 0.2)", color: "hsl(270 70% 60%)" },
    legendary: { bg: "hsl(40 95% 55% / 0.2)", color: "hsl(40 95% 55%)" },
  };

  const filtered = useMemo(() => {
    let next = items;
    if (search) {
      const q = search.toLowerCase();
      next = next.filter((item) => item.name.toLowerCase().includes(q));
    }
    if (rarityFilter) {
      next = next.filter((item) => rarityFilter === (item.rarity || "common").toLowerCase());
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
        const left = rarityOrder[(a.rarity || "common").toLowerCase()] || 0;
        const right = rarityOrder[(b.rarity || "common").toLowerCase()] || 0;
        return sortDir === "asc" ? left - right : right - left;
      }
      case "name":
      default:
        return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
  });
  return sorted;
  }, [search, rarityFilter, typeFilter, sortField, sortDir, valueRange.max, valueRange.min]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
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
    setPage(1);
    setRarityFilter((prev) => (prev === value ? "" : value));
  };

  const toggleType = (value: string) => {
    setPage(1);
    setTypeFilter((prev) => (prev === value ? "" : value));
  };

  const applyValueRange = (min?: number, max?: number) => {
    setPage(1);
    setValueRange({ min, max });
  };

  useEffect(() => {
    setValueDraft({
      min: valueRange.min !== undefined ? String(valueRange.min) : "",
      max: valueRange.max !== undefined ? String(valueRange.max) : "",
    });
  }, [valueRange.min, valueRange.max]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">Items</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Items Database</h1>
          <p className="text-muted-foreground">Search and browse the current ARC Raiders item pool.</p>
        </div>
        <button className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary" type="button" aria-label="Save page">
          <Star className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search items..."
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
                    Name
                    <ArrowDownUp className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSort("rarity")}
                      className="flex items-center gap-1 font-medium transition hover:text-foreground"
                    >
                      Rarity
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
                          <span>Rarity</span>
                          <button
                            type="button"
                            onClick={() => setRarityFilter([])}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-col gap-1">
                          {rarities.map((r) => {
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
                                <span className="capitalize">{r}</span>
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
                      Value
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
                          <span>Value Range</span>
                          <button
                            type="button"
                            onClick={() => setValueRange({})}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="text-xs text-muted-foreground">
                            Min
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
                            Max
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
                          Apply
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="px-3 py-2 text-left">Weight</th>
                <th className="px-3 py-2 text-left">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSort("type")}
                      className="flex items-center gap-1 font-medium transition hover:text-foreground"
                    >
                      Type
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
                          <span>Type</span>
                          <button
                            type="button"
                            onClick={() => setTypeFilter([])}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-col gap-1">
                          {types.map((t) => {
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
                                <span>{t}</span>
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
              {paginated.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/60 transition hover:bg-secondary/30"
                >
                  <td className="px-3 py-3">
                    <Link href={`/items/${item.id}`} className="flex items-center gap-3 text-foreground transition hover:text-primary">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary">
                        {item.icon ? (
                          <img src={item.icon} alt="" className="h-10 w-10 rounded object-contain" />
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
                      const key = (item.rarity || "common").toLowerCase();
                      const style = rarityStyles[key] || rarityStyles.common;
                      return (
                        <span
                          className="rounded px-2 py-1 text-xs font-semibold uppercase"
                          style={{ backgroundColor: style.bg, color: style.color }}
                        >
                          {item.rarity || "Common"}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-3 text-primary">{item.value ?? 0}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {item.stat_block?.weight ? `${item.stat_block.weight}kg` : "-"}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{item.item_type || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-10 text-center text-muted-foreground">
            No items found. Try adjusting your filters.
          </div>
        )}
      </div>

      <Pagination basePath="/items" currentPage={safePage} totalPages={totalPages} className="pt-2" />
    </div>
  );
}
