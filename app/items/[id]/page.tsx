import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { items } from "@/lib/database";

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = items.find((i) => i.id === params.id);
  if (!item) return notFound();

  const rarityStyles: Record<string, { bg: string; color: string }> = {
    common: { bg: "hsl(0 0% 18% / 0.6)", color: "hsl(0 0% 60%)" },
    uncommon: { bg: "hsl(120 40% 50% / 0.2)", color: "hsl(120 40% 50%)" },
    rare: { bg: "hsl(210 80% 55% / 0.2)", color: "hsl(210 80% 55%)" },
    epic: { bg: "hsl(270 70% 60% / 0.2)", color: "hsl(270 70% 60%)" },
    legendary: { bg: "hsl(40 95% 55% / 0.2)", color: "hsl(40 95% 55%)" },
  };

  const rarityKey = (item.rarity || "common").toLowerCase();
  const rarityStyle = rarityStyles[rarityKey] || rarityStyles.common;

  return (
    <div className="w-full px-[100px] py-8 space-y-8">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/items" className="text-muted-foreground transition-colors hover:text-foreground">
          Items
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">{item.name}</span>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-1/3">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
            {item.icon ? (
              <img src={item.icon} alt={item.name} className="h-full w-full object-contain p-6" />
            ) : (
              <span className="text-muted-foreground">No image</span>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="rounded px-3 py-1 text-sm font-semibold uppercase"
              style={{ backgroundColor: rarityStyle.bg, color: rarityStyle.color }}
            >
              {item.rarity || "Common"}
            </span>
            <button className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary" type="button">
              <Star className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <h1 className="font-display text-4xl font-bold text-foreground">{item.name}</h1>
          {item.item_type && <p className="text-primary text-lg">{item.item_type}</p>}
          {item.description && <p className="text-muted-foreground">{item.description}</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-4">
            {item.value !== undefined && (
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Value</p>
                <p className="text-2xl font-bold text-primary">{item.value}</p>
              </div>
            )}
            {item.stat_block?.weight !== undefined && (
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="text-2xl font-bold text-foreground">{item.stat_block.weight}kg</p>
              </div>
            )}
            {item.stat_block?.stackSize !== undefined && (
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Stack Size</p>
                <p className="text-2xl font-bold text-foreground">{item.stat_block.stackSize}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-xl font-semibold mb-3">Where to find</h2>
        {item.locations && item.locations.length > 0 ? (
          <ul className="space-y-2 text-muted-foreground">
            {item.locations.map((loc) => (
              <li key={loc}>{loc}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Location data not available.</p>
        )}
      </section>
    </div>
  );
}
