import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { traders } from "@/lib/database";

export default function TraderDetailPage({ params }: { params: { id: string } }) {
  const trader = traders.find((t) => t.id === params.id);
  if (!trader) return notFound();

  return (
    <div className="w-full px-[100px] py-8 space-y-8">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/traders" className="text-muted-foreground transition-colors hover:text-foreground">
          Traders
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">{trader.name}</span>
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary">
          {trader.image ? (
            <img src={trader.image} alt={trader.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-muted-foreground">?</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-foreground">{trader.name}</h1>
            <button className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary" type="button">
              <Star className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <p className="text-muted-foreground">{trader.description}</p>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-left">Rarity</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Trader Price</th>
              </tr>
            </thead>
            <tbody>
              {trader.items.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="px-3 py-3 font-medium text-foreground">{item.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{item.rarity || "-"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{item.item_type || "-"}</td>
                  <td className="px-3 py-3 text-primary">{item.trader_price ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
