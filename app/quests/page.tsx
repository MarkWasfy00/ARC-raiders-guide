'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { quests } from "@/lib/database";
import { DatabaseHeader } from "@/components/DatabaseHeader";
import { Pagination } from "@/components/common/Pagination";

export default function QuestsPage() {
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get("page") || "1");
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(quests.length / pageSize));
  const safePage = Math.min(Math.max(Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1, 1), totalPages);
  const paginated = quests.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="w-full px-[100px] py-8 space-y-6">
      <DatabaseHeader
        title="ARC Raiders Database"
        breadcrumbs={[
          { label: "Arc Raiders", href: "/" },
          { label: "Database" },
          { label: "Quests" },
        ]}
        action={
          <button className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary" type="button" aria-label="Save page">
            <Star className="h-5 w-5 text-muted-foreground" />
          </button>
        }
      />

      <div className="space-y-3">
        {paginated.map((quest) => (
          <Link
            key={quest.id}
            href={`/quests/${quest.id}`}
            className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary/60"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-foreground">{quest.name}</h3>
              <span className="rounded bg-secondary px-3 py-1 text-xs text-muted-foreground">{quest.objectives.length} objectives</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {quest.objectives.join(" · ")}
            </p>
          </Link>
        ))}
      </div>

      <Pagination basePath="/quests" currentPage={safePage} totalPages={totalPages} className="pt-2" />
    </div>
  );
}
