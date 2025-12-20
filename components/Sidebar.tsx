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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
  external?: boolean;
}

const mainItems: SidebarItem[] = [
  { icon: Home, label: 'الرئيسية', href: '/' },
  { icon: FileText, label: 'الأدلة', href: '/guides' },
  { icon: AppWindow, label: 'تطبيق التراكب', href: 'https://www.overwolf.com/app/metaforge', external: true },
  { icon: Package, label: 'السوق', href: '/marketplace' },
  { icon: Layers, label: 'مستويات قيمة الغنائم', href: '/loot-value' },
  { icon: Target, label: 'العناصر المطلوبة', href: '/needed-items' },
];

const databaseItems: SidebarItem[] = [
  {
    icon: Database,
    label: 'قاعدة البيانات',
    children: [
      { label: 'آركس', href: '/arcs' },
      { label: 'العناصر', href: '/items' },
      { label: 'المهام', href: '/quests' },
      { label: 'التجار', href: '/traders' },
    ]
  },
];

const mapItems: SidebarItem[] = [
  {
    icon: Map,
    label: 'الخرائط',
    children: [
      { label: 'عرض الكل', href: '/maps' },
      { label: 'السد', href: '/maps/dam' },
      { label: 'الميناء الفضائي', href: '/maps/spaceport' },
      { label: 'المدينة المدفونة', href: '/maps/buried-city' },
      { label: 'البوابة الزرقاء', href: '/maps/blue-gate' },
      { label: 'ستيلا مونتيس', href: '/maps/stella-montis' },
    ]
  },
];

const trackerItems: SidebarItem[] = [
  {
    icon: Crosshair,
    label: 'المتتبعات',
    children: [
      { label: 'متتبع المخبأ', href: '/trackers/hideout' },
      { label: 'متتبع الوصفات', href: '/trackers/recipe' },
    ]
  },
];

const otherItems: SidebarItem[] = [
  { icon: Swords, label: 'التجهيزات', href: '/loadouts' },
  { icon: ScrollText, label: 'شجرة المهارات', href: '/skilltree' },
  { icon: Trophy, label: 'قوائم المستويات', href: '/tier-lists' },
  { icon: Calendar, label: 'مؤقت الأحداث', href: '/events' },
  { icon: Code, label: 'واجهة برمجية', href: '/api' },
];

const externalItems: SidebarItem[] = [
  { icon: MessageCircle, label: 'ريديت', href: 'https://www.reddit.com/r/ArcRaiders/', external: true },
  { icon: Users, label: 'مركز ديسكورد', href: 'https://discord.com/invite/mVMtSsfswq', external: true },
];

const bottomItems: SidebarItem[] = [
  { icon: Settings, label: 'الإعدادات', href: '/settings' },
  { icon: MessageCircle, label: 'ديسكورد', href: 'https://discord.com/invite/8UEK9TrQDs', external: true },
  { icon: Shield, label: 'سياسة الخصوصية', href: '/privacy' },
  { icon: FileQuestion, label: 'شروط الخدمة', href: '/terms' },
  { icon: Mail, label: 'اتصل بنا', href: '/contact' },
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
              <Button
                variant="ghost"
                onClick={() => toggleMenu(item.label)}
                className={cn(
                  "w-full justify-start gap-3 h-auto px-3 py-2",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isChildActive(item.children!) && "text-primary bg-sidebar-accent/10"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {expanded && (
                  <>
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      isOpen && "rotate-180"
                    )} />
                  </>
                )}
              </Button>

              {expanded && isOpen && (
                <div className="mr-8 mt-1 space-y-1 animate-fade-in">
                  {item.children!.map((child) => (
                    <Button
                      key={child.href}
                      variant="ghost"
                      asChild
                      className={cn(
                        "w-full justify-start h-auto px-3 py-1.5 text-sm",
                        isActive(child.href)
                          ? "text-sidebar-accent-foreground bg-sidebar-accent"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Link href={child.href}>{child.label}</Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        }

        if (item.external) {
          return (
            <Button
              key={item.label}
              variant="ghost"
              asChild
              className={cn(
                "w-full justify-start gap-3 h-auto px-3 py-2",
                active
                  ? "text-sidebar-accent-foreground bg-sidebar-accent"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon className="w-5 h-5 shrink-0" />
                {expanded && <span className="text-sm">{item.label}</span>}
              </a>
            </Button>
          );
        }

        return (
          <Button
            key={item.label}
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start gap-3 h-auto px-3 py-2",
              active
                ? "text-sidebar-accent-foreground bg-sidebar-accent"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Link href={item.href!}>
              <Icon className="w-5 h-5 shrink-0" />
              {expanded && <span className="text-sm">{item.label}</span>}
            </Link>
          </Button>
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
        "fixed right-0 top-14 bottom-0 bg-sidebar border-l border-sidebar-border z-40",
        "transition-all duration-300 ease-out overflow-hidden",
        expanded ? "w-56" : "w-14"
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex flex-col h-full py-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Game icon at top */}
        <div className="px-3 mb-4">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-lg",
              "text-primary hover:bg-sidebar-accent transition-colors"
            )}
          >
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">AR</span>
            </div>
            {expanded && <span className="text-sm font-medium">آرك رايدرز</span>}
          </Link>
        </div>

        {/* Main section */}
        <div className="px-2 space-y-6 flex-1">
          <SidebarSection items={mainItems} expanded={expanded} />

          <div className="space-y-4">
            <Separator className="bg-sidebar-border" />
            <SidebarSection items={databaseItems} expanded={expanded} />
          </div>

          <div className="space-y-4">
            <Separator className="bg-sidebar-border" />
            <SidebarSection items={mapItems} expanded={expanded} />
          </div>

          <div className="space-y-4">
            <Separator className="bg-sidebar-border" />
            <SidebarSection items={trackerItems} expanded={expanded} />
          </div>

          <div className="space-y-4">
            <Separator className="bg-sidebar-border" />
            <SidebarSection items={otherItems} expanded={expanded} />
          </div>

          <div className="space-y-4">
            <Separator className="bg-sidebar-border" />
            <SidebarSection items={externalItems} expanded={expanded} />
          </div>
        </div>

        {/* Bottom section */}
        <div className="px-2 mt-auto space-y-4">
          <Separator className="bg-sidebar-border" />
          <SidebarSection items={bottomItems} expanded={expanded} />
        </div>
      </div>
    </aside>
  );
}
