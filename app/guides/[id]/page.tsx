"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getGuideById } from "@/lib/guides";

const formatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const guide = getGuideById(id);
  const [activeSection, setActiveSection] = React.useState("introduction");

  const sections = React.useMemo(
    () => [
      {
        id: "introduction",
        title: "Introduction",
        body:
          "Welcome to this comprehensive guide for Arc Raiders. This guide covers the key concepts and strategies you need to succeed—use it as a quick refresher before every drop.",
      },
      {
        id: "getting-started",
        title: "Getting Started",
        body:
          "Before diving into hard fights, nail the fundamentals: movement, combat rhythms, and smart resource management. Build repeatable routes and keep two extraction plans ready.",
        bullets: [
          "Learn map layouts and extraction points.",
          "Practice recoil control and quick peeks.",
          "Understand the economy and value-to-weight.",
          "Study ARC behavior patterns.",
        ],
      },
      {
        id: "tips",
        title: "Tips & Tricks",
        body: "Layer these habits on top of your fundamentals to boost survival and loot per run.",
        tips: [
          { title: "Always have an exit plan", detail: "Know your extraction routes before engaging." },
          { title: "Prioritize high-value loot", detail: "Focus on the best value-to-weight items." },
          { title: "Work with your team", detail: "Coordination wins more fights than raw aim." },
        ],
      },
      {
        id: "conclusion",
        title: "Conclusion",
        body:
          "Apply these routes, review your fights, and keep refining. Every raid is a rep—stay intentional and iterate.",
      },
    ],
    []
  );

  if (!guide) {
    return notFound();
  }

  return (
    <div className="w-full px-[100px] py-8 space-y-8">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/guides" className="text-muted-foreground transition-colors hover:text-foreground">
          Guides
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground line-clamp-1">{guide.title}</span>
      </div>

      <div className="relative h-48 overflow-hidden rounded-xl border border-border bg-card md:h-64">
        {guide.image ? (
          <img src={guide.image} alt={guide.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-foreground">{guide.title}</h1>
            <button
              className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary"
              aria-label="Save guide"
              type="button"
            >
              <Star className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          {guide.created_at && (
            <p className="mt-2 text-sm text-muted-foreground">
              Published: {formatter.format(new Date(guide.created_at))}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 space-y-8">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold mb-4">{section.title}</h2>
              <p className="text-muted-foreground">{section.body}</p>

              {section.bullets && (
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="text-primary">-</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.tips && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {section.tips.map((tip) => (
                    <div key={tip.title} className="rounded-lg bg-secondary p-4">
                      <h4 className="font-semibold text-foreground">{tip.title}</h4>
                      <p className="text-sm text-muted-foreground">{tip.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <aside className="hidden w-48 shrink-0 lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">On this page</p>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "block rounded px-3 py-1.5 text-sm transition-colors",
                  activeSection === section.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {section.title}
              </a>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
