'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { guides } from "@/lib/guides";
import { GuideCard } from "@/components/guides/GuideCard";
import { Pagination } from "@/components/guides/Pagination";

export default function GuidesPage() {
  const searchParams = useSearchParams();
  const rawPage = Number(searchParams.get("page") || 1);
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(guides.length / pageSize));
  const currentPage = Math.min(Math.max(Number.isNaN(rawPage) ? 1 : rawPage, 1), totalPages);

  const paginatedGuides = guides.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full px-[100px] py-8 space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">Guides</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Guides</h1>
        </div>
        <button
          className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary"
          aria-label="Save Guides page to favorites"
          type="button"
        >
          <Star className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedGuides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} className="pt-4" />
    </div>
  );
}
