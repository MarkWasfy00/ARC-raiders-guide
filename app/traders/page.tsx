'use client';

import Link from "next/link";
import { Star } from "lucide-react";
import { traders } from "@/lib/database";

export default function TradersPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">Traders</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Traders</h1>
          <p className="text-muted-foreground">Browse each trader and their stock lists.</p>
        </div>
        <button className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary" type="button">
          <Star className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {traders.map((trader) => (
          <Link
            key={trader.id}
            href={`/traders/${trader.id}`}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/60"
          >
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-secondary">
              {trader.image ? (
                <img src={trader.image} alt={trader.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-muted-foreground">?</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {trader.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{trader.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{trader.items.length} items</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
