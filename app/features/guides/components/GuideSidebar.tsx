'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
}

interface GuideSidebarProps {
  sections: Section[];
}

export function GuideSidebar({ sections }: GuideSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <aside className="hidden w-48 shrink-0 lg:block">
      <div className="sticky top-24 space-y-1">
        <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
          في هذه الصفحة
        </p>
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection(section.id);
              document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={cn(
              'block rounded px-3 py-1.5 text-sm transition-colors',
              activeSection === section.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {section.title}
          </a>
        ))}
      </div>
    </aside>
  );
}
