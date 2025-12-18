'use client';

import Link from "next/link";
import { Star } from "lucide-react";
import { quests } from "@/lib/database";

export default function QuestsPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">Quests</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Quest Log</h1>
          <p className="text-muted-foreground">Track key objectives and rewards.</p>
        </div>
        <button className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary" type="button">
          <Star className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-3">
        {quests.map((quest) => (
          <Link
            key={quest.id}
            href={`/quests/${quest.id}`}
            className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary/60"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-foreground">{quest.name}</h3>
              <span className="rounded bg-secondary px-3 py-1 text-xs text-muted-foreground">{quest.objectives.length} objectives</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {quest.objectives.join(" · ")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
