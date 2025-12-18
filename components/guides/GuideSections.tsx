'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Guide } from "@/types";

interface GuideSectionsProps {
  guide: Guide;
}

export function GuideSections({ guide }: GuideSectionsProps) {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      body: guide.content
        ? guide.content
        : "This overview collects the core ideas and tactics you need before dropping in. Use it as a quick refresher before every raid.",
    },
    {
      id: "getting-started",
      title: "Getting Started",
      body:
        "Lock down the basics before you chase high-value loot. Focus on movement, resource discipline, and keeping your routes safe and repeatable.",
      bullets: [
        "Learn the most common extraction points and keep two backups.",
        "Practice recoil control and quick peeks on easy targets.",
        "Carry only what you can afford to lose and stash early valuables.",
        "Track time in raid so you are not fighting against the clock.",
      ],
    },
    {
      id: "tips",
      title: "Tips and Tricks",
      body:
        "Layer these habits on top of your fundamentals to stay alive longer and extract more often.",
      tips: [
        {
          title: "Always have an exit plan",
          detail: "Mark a safe path out before you start a fight. Most wipes happen because teams overstay.",
        },
        {
          title: "Prioritize value to weight",
          detail: "Upgrade your pack by swapping low value items for compact, high value pieces as you loot.",
        },
        {
          title: "Communicate cooldowns",
          detail: "Short, clear comms about cooldowns and positions win more fights than mechanical skill alone.",
        },
      ],
    },
    {
      id: "conclusion",
      title: "Conclusion",
      body:
        "Guides are only as good as the reps you put in. Run these routes, review your fights, and keep refining your plan every raid.",
    },
  ];

  const [activeSection, setActiveSection] = useState(sections[0].id);

  return (
    <div className="flex gap-8">
      <div className="flex-1 space-y-8">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold">{section.title}</h2>
            <p className="mt-3 text-muted-foreground">{section.body}</p>

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
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">On this page</p>
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
  );
}
