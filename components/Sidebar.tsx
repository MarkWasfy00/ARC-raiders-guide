'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, FileText, AppWindow, Package, Database, Map, Target,
  Wrench, List, Calendar, Code, MessageCircle, Settings,
  Shield, FileQuestion, Mail, ChevronDown, ChevronRight,
  Swords, ScrollText, Users, MapPin, Crosshair, Trophy, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
  external?: boolean;
}

const mainItems: SidebarItem[] = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: FileText, label: 'Guides', href: '/guides' },
  { icon: AppWindow, label: 'Overlay App', href: 'https://www.overwolf.com/app/metaforge', external: true },
  { icon: Package, label: 'Marketplace', href: '/marketplace' },
  { icon: Layers, label: 'Loot Value Tiers', href: '/loot-value' },
  { icon: Target, label: 'Needed Items', href: '/needed-items' },
];

const databaseItems: SidebarItem[] = [
  {
    icon: Database,
    label: 'Database',
    children: [
      { label: 'ARCs', href: '/arcs' },
      { label: 'Items', href: '/items' },
      { label: 'Quests', href: '/quests' },
      { label: 'Traders', href: '/traders' },
    ]
  },
];

const mapItems: SidebarItem[] = [
  {
    icon: Map,
    label: 'Maps',
    children: [
      { label: 'View All', href: '/maps' },
      { label: 'Dam', href: '/maps/dam' },
      { label: 'Spaceport', href: '/maps/spaceport' },
      { label: 'Buried City', href: '/maps/buried-city' },
      { label: 'Blue Gate', href: '/maps/blue-gate' },
      { label: 'Stella Montis', href: '/maps/stella-montis' },
    ]
  },
];

const trackerItems: SidebarItem[] = [
  {
    icon: Crosshair,
    label: 'Trackers',
    children: [
      { label: 'Hideout Tracker', href: '/trackers/hideout' },
      { label: 'Recipe Tracker', href: '/trackers/recipe' },
    ]
  },
];

const otherItems: SidebarItem[] = [
  { icon: Swords, label: 'Loadouts', href: '/loadouts' },
  { icon: ScrollText, label: 'Skilltree', href: '/skilltree' },
  { icon: Trophy, label: 'Tier Lists', href: '/tier-lists' },
  { icon: Calendar, label: 'Event Timer', href: '/events' },
  { icon: Code, label: 'API & Tooltip', href: '/api' },
];

const externalItems: SidebarItem[] = [
  { icon: MessageCircle, label: 'Reddit', href: 'https://www.reddit.com/r/ArcRaiders/', external: true },
  { icon: Users, label: 'LFG Discord Hub', href: 'https://discord.com/invite/mVMtSsfswq', external: true },
];

const bottomItems: SidebarItem[] = [
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: MessageCircle, label: 'Discord', href: 'https://discord.com/invite/8UEK9TrQDs', external: true },
  { icon: Shield, label: 'Privacy Policy', href: '/privacy' },
  { icon: FileQuestion, label: 'Terms of Service', href: '/terms' },
  { icon: Mail, label: 'Contact', href: '/contact' },
];

function SidebarSection({ items, expanded }: { items: SidebarItem[]; expanded: boolean }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isChildActive = (children: { href: string }[]) =>
    children.some(child => pathname === child.href);

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus.includes(item.label) || (hasChildren && isChildActive(item.children!));
        const active = item.href ? isActive(item.href) : false;

        if (hasChildren) {
          return (
            <div key={item.label}>
              <button
                onClick={() => toggleMenu(item.label)}
                className={cn(
                  "w-full flex items-center rounded-lg transition-colors",
                  expanded ? "gap-3 px-3 py-2 justify-start" : "justify-center px-2 py-2",
                  "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent",
                  isChildActive(item.children!) && "text-primary"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {expanded && (
                  <>
                    <span className="flex-1 text-left text-base">{item.label}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      isOpen && "rotate-180"
                    )} />
                  </>
                )}
              </button>

              {expanded && isOpen && (
                <div
                  className="ml-8 mt-1 space-y-1 overflow-hidden transition-[max-height] duration-300 ease-out"
                  style={{ maxHeight: isOpen ? item.children!.length * 44 : 0 }}
                >
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "block px-3 py-1.5 text-sm rounded-lg transition-colors",
                        isActive(child.href)
                          ? "text-primary bg-sidebar-accent"
                          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }

        if (item.external) {
          return (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center rounded-lg transition-colors",
                expanded ? "gap-3 px-3 py-2 justify-start" : "justify-center px-2 py-2",
                active ? "text-primary bg-sidebar-accent" : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {expanded && <span className="text-base">{item.label}</span>}
            </a>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href!}
            className={cn(
              "flex items-center rounded-lg transition-colors",
              expanded ? "gap-3 px-3 py-2 justify-start" : "justify-center px-2 py-2",
              active ? "text-primary bg-sidebar-accent" : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {expanded && <span className="text-base">{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-14 bottom-0 bg-sidebar border-r border-sidebar-border z-40",
        "transition-all duration-300 ease-out overflow-hidden",
        expanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex flex-col h-full py-4 overflow-y-auto scrollbar-thin">
        {/* Game icon at top */}
        <div className="px-3 mb-4">
          <Link
            href="/"
            className={cn(
              "flex w-full items-center rounded-lg",
              expanded ? "gap-3 px-3 py-2 justify-start" : "justify-center py-2",
              "text-primary hover:bg-sidebar-accent transition-colors"
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded bg-primary/20 text-primary shrink-0">
              <span className="text-sm font-bold">AR</span>
            </div>
            {expanded && <span className="text-base font-medium">Arc Raiders</span>}
          </Link>
        </div>
        <div className="mx-3 mb-4 border-b border-sidebar-border" />

        {/* Main section */}
        <div className="px-2 space-y-6 flex-1">
          <SidebarSection items={mainItems} expanded={expanded} />

          <div className="border-t border-sidebar-border pt-4">
            <SidebarSection items={databaseItems} expanded={expanded} />
          </div>

          <div className="border-t border-sidebar-border pt-4">
            <SidebarSection items={mapItems} expanded={expanded} />
          </div>

          <div className="border-t border-sidebar-border pt-4">
            <SidebarSection items={trackerItems} expanded={expanded} />
          </div>

          <div className="border-t border-sidebar-border pt-4">
            <SidebarSection items={otherItems} expanded={expanded} />
          </div>

          <div className="border-t border-sidebar-border pt-4">
            <SidebarSection items={externalItems} expanded={expanded} />
          </div>
        </div>

        {/* Bottom section */}
        <div className="px-2 mt-auto pt-4 border-t border-sidebar-border">
          <SidebarSection items={bottomItems} expanded={expanded} />
        </div>
      </div>
    </aside>
  );
}
