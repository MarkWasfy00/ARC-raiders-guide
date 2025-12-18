import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getGuideById } from "@/lib/guides";
import { GuideSections } from "@/components/guides/GuideSections";

const formatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function GuideDetailPage({ params }: { params: { id: string } }) {
  const guide = getGuideById(params.id);

  if (!guide) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/guides" className="text-muted-foreground transition-colors hover:text-foreground">
          Guides
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground line-clamp-1">{guide.title}</span>
      </div>

      <div className="relative h-52 overflow-hidden rounded-xl border border-border bg-card md:h-64">
        {guide.image ? (
          <img src={guide.image} alt={guide.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-foreground">{guide.title}</h1>
            <button
              className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary"
              aria-label="Save guide"
              type="button"
            >
              <Star className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          {guide.created_at && (
            <p className="mt-2 text-sm text-muted-foreground">
              Published: {formatter.format(new Date(guide.created_at))}
            </p>
          )}
        </div>
      </div>

      <GuideSections guide={guide} />
    </div>
  );
}
