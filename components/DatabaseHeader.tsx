'use client';

import Link from "next/link";
import { VisualSectionTabs } from "@/components/VisualSectionTabs";
import { cn } from "@/lib/utils";

type Crumb = {
  label: string;
  href?: string;
};

interface DatabaseHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs: Crumb[];
  action?: React.ReactNode;
}

export function DatabaseHeader({ title, subtitle, breadcrumbs, action }: DatabaseHeaderProps) {
  return (
    <div className="pb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <h1 className="font-display text-3xl font-bold text-foreground leading-none">ARC Raiders Database</h1>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={`${crumb.label}-${idx}`} className="flex items-center gap-2">
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className="transition-colors hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={cn(isLast ? "text-foreground" : "text-muted-foreground")}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <span className="text-muted-foreground">/</span>}
              </div>
            );
          })}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="mt-4">
        <VisualSectionTabs />
      </div>
    </div>
  );
}
