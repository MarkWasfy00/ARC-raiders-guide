import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  className?: string;
}

function buildHref(basePath: string, page: number) {
  if (page <= 1) return basePath;
  const params = new URLSearchParams();
  params.set("page", page.toString());
  return `${basePath}?${params.toString()}`;
}

function getPages(currentPage: number, totalPages: number) {
  const pages: Array<number | string> = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) pages.push(i);
  } else {
    pages.push(1, 2, 3, 4, "...", totalPages);
  }
  return pages;
}

export function Pagination({ currentPage, totalPages, basePath, className }: PaginationProps) {
  if (totalPages <= 0) return null;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const pages = getPages(safePage, totalPages);

  return (
    <nav
      className={cn(
        "fixed bottom-4 left-1/2 z-50 inline-flex -translate-x-1/2 transform items-center justify-center gap-1 rounded-full bg-background/90 px-3 py-2 shadow-lg backdrop-blur supports-[backdrop-filter]:backdrop-blur",
        className
      )}
      aria-label="Pagination"
    >
      {pages.map((page, idx) =>
        typeof page === "number" ? (
          <Link
            key={page}
            href={buildHref(basePath, page)}
            aria-current={safePage === page ? "page" : undefined}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors",
              safePage === page
                ? "border border-muted-foreground text-foreground shadow-lg shadow-border/40"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {page}
          </Link>
        ) : (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
            {page}
          </span>
        )
      )}
    </nav>
  );
}
