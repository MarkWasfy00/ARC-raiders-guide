import Link from "next/link";
import { cn } from "@/lib/utils";
import type { GuideData } from "../types";

interface GuideCardProps {
  guide: GuideData;
  className?: string;
}

const formatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function GuideCard({ guide, className }: GuideCardProps) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/60 transition-all",
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        {guide.featuredImage ? (
          <img
            src={guide.featuredImage}
            alt={guide.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary text-sm text-muted-foreground">
            No image
          </div>
        )}
        {guide.created_at && (
          <span className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
            {formatter.format(new Date(guide.created_at))}
          </span>
        )}
      </div>

      <div className="space-y-2 p-4">
        <h3 className="font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-2">
          {guide.title}
        </h3>
        {guide.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{guide.description}</p>
        )}
      </div>
    </Link>
  );
}
