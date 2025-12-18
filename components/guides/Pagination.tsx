import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  className?: string;
}

function buildHref(basePath: string, page: number) {
  if (page <= 1) return basePath;
  const params = new URLSearchParams();
  params.set("page", page.toString());
  return `${basePath}?${params.toString()}`;
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const pages: Array<number | string> = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (currentPage > 3) pages.push("...");

  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i += 1) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) pages.push("...");

  pages.push(totalPages);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = "/guides",
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const pages = getPageNumbers(safePage, totalPages);

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)} aria-label="Pagination">
      <Link
        href={buildHref(basePath, safePage - 1)}
        aria-disabled={safePage === 1}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded border border-border text-sm text-muted-foreground transition-colors",
          "hover:text-foreground hover:bg-secondary",
          safePage === 1 && "pointer-events-none opacity-50"
        )}
      >
        Prev
      </Link>

      {pages.map((page, idx) =>
        typeof page === "number" ? (
          <Link
            key={page}
            href={buildHref(basePath, page)}
            aria-current={safePage === page ? "page" : undefined}
            className={cn(
              "flex h-9 min-w-[2.25rem] items-center justify-center rounded border border-border text-sm transition-colors",
              safePage === page
                ? "bg-primary text-primary-foreground"
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

      <Link
        href={buildHref(basePath, safePage + 1)}
        aria-disabled={safePage === totalPages}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded border border-border text-sm text-muted-foreground transition-colors",
          "hover:text-foreground hover:bg-secondary",
          safePage === totalPages && "pointer-events-none opacity-50"
        )}
      >
        Next
      </Link>
    </nav>
  );
}
