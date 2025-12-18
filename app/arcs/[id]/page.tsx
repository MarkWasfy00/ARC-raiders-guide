import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { arcs } from "@/lib/database";

export default function ArcDetailPage({ params }: { params: { id: string } }) {
  const arc = arcs.find((a) => a.id === params.id);
  if (!arc) return notFound();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/arcs" className="text-muted-foreground transition-colors hover:text-foreground">
          ARCs
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">{arc.name}</span>
      </div>

      <div className="relative h-56 overflow-hidden rounded-xl border border-border bg-card md:h-72">
        {arc.image ? (
          <img src={arc.image} alt={arc.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary text-muted-foreground">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-foreground">{arc.name}</h1>
            <button className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary" type="button">
              <Star className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-xl font-semibold mb-3">Overview</h2>
        <p className="text-muted-foreground">{arc.description || "No description available."}</p>
      </section>
    </div>
  );
}
