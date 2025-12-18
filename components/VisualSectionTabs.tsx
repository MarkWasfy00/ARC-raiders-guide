'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sections = [
  {
    key: "arcs",
    title: "ARCs",
    description: "Track every ARC type and counter.",
    href: "/arcs",
    image: "/images/categories/arcs.webp",
  },
  {
    key: "items",
    title: "Items",
    description: "Browse gear, loot, and value tiers.",
    href: "/items",
    image: "/images/categories/items.webp",
  },
  {
    key: "quests",
    title: "Quests",
    description: "Follow objectives and rewards.",
    href: "/quests",
    image: "/images/categories/quests.webp",
  },
  {
    key: "traders",
    title: "Traders",
    description: "Check stock lists and offers.",
    href: "/traders",
    image: "/images/categories/traders.webp",
  },
];

export function VisualSectionTabs() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {sections.map((section) => {
        const active = isActive(section.href);
        return (
          <Link
            key={section.key}
            href={section.href}
            className={cn(
              "group relative overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg",
              active ? "border-primary ring-2 ring-primary/50" : "border-border"
            )}
          >
            <div className="relative aspect-[16/4] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%), url(${section.image})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            </div>
            <div className="absolute inset-0 flex items-end p-4">
              <div className="text-white drop-shadow-sm">
                <h3 className="font-display text-xl font-semibold leading-tight">
                  {section.title}
                </h3>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
