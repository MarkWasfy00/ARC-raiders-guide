'use client';

import Link from "next/link";
import { Star } from "lucide-react";
import { arcs } from "@/lib/database";

export default function ArcsPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">ARCs</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">ARC Database</h1>
          <p className="text-muted-foreground">Know your enemies and prepare counters.</p>
        </div>
        <button className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary" type="button">
          <Star className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {arcs.map((arc) => (
          <Link
            key={arc.id}
            href={`/arcs/${arc.id}`}
            className="group relative overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/60"
          >
            <div className="relative h-40 overflow-hidden">
              {arc.image ? (
                <img src={arc.image} alt={arc.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center bg-secondary text-muted-foreground">No image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="space-y-2 p-4">
              <h3 className="font-display text-xl font-semibold text-foreground">{arc.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{arc.description || "No description"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
