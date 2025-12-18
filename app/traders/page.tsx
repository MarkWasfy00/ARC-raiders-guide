'use client';

import Link from "next/link";
import { Star } from "lucide-react";
import { traders } from "@/lib/database";
import { DatabaseHeader } from "@/components/DatabaseHeader";

export default function TradersPage() {
  return (
    <div className="w-full px-[100px] py-8 space-y-6">
      <DatabaseHeader
        title="ARC Raiders Database"
        breadcrumbs={[
          { label: "Arc Raiders", href: "/" },
          { label: "Database" },
          { label: "Traders" },
        ]}
        action={
          <button className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary" type="button" aria-label="Save page">
            <Star className="h-5 w-5 text-muted-foreground" />
          </button>
        }
      />

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
