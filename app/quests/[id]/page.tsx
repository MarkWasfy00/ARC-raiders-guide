import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { quests } from "@/lib/database";

export default function QuestDetailPage({ params }: { params: { id: string } }) {
  const quest = quests.find((q) => q.id === params.id);
  if (!quest) return notFound();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/quests" className="text-muted-foreground transition-colors hover:text-foreground">
          Quests
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">{quest.name}</span>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="font-display text-3xl font-bold text-foreground">{quest.name}</h1>
        <button className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary" type="button">
          <Star className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <section className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold">Objectives</h2>
        <ul className="space-y-2 text-muted-foreground">
          {quest.objectives.map((objective) => (
            <li key={objective} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold">Rewards</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-secondary/40 p-4">
            <p className="text-xs text-muted-foreground">Experience</p>
            <p className="text-2xl font-bold text-primary">{quest.xp ?? 0}</p>
          </div>
          {quest.rewards.map((reward) => (
            <div key={reward.item.id} className="rounded-lg border border-border bg-secondary/40 p-4">
              <p className="text-xs text-muted-foreground">Item</p>
              <p className="text-lg font-semibold text-foreground">{reward.item.name}</p>
              <p className="text-sm text-muted-foreground">{reward.quantity}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
