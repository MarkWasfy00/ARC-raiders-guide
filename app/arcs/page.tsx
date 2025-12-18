'use client';

import Link from "next/link";
import { Star } from "lucide-react";
import { arcs } from "@/lib/database";
import { DatabaseHeader } from "@/components/DatabaseHeader";

export default function ArcsPage() {
  return (
    <div className="w-full px-[100px] py-8 space-y-6">
      <DatabaseHeader
        title="ARC Raiders Database"
        breadcrumbs={[
          { label: "Arc Raiders", href: "/" },
          { label: "Database" },
          { label: "ARCs" },
        ]}
        action={
          <button className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary" type="button" aria-label="Save page">
            <Star className="h-5 w-5 text-muted-foreground" />
          </button>
        }
      />

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
