"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Map,
  Settings,
  Shield,
  Activity,
} from "lucide-react";

interface NavItem {
  label: string;
  labelAr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    labelAr: "لوحة التحكم",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    labelAr: "المستخدمين",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Guides",
    labelAr: "الأدلة",
    href: "/admin/guides",
    icon: BookOpen,
  },
  {
    label: "Blogs",
    labelAr: "المقالات",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    label: "Maps",
    labelAr: "الخرائط",
    href: "/admin/maps",
    icon: Map,
  },
  {
    label: "Activity Logs",
    labelAr: "سجل النشاطات",
    href: "/admin/activity-logs",
    icon: Activity,
  },
  {
    label: "Settings",
    labelAr: "الإعدادات",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const isModerator = session?.user?.role === 'MODERATOR';

  return (
    <aside className="flex h-screen w-64 flex-col border-l border-border bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">لوحة الإدارة</h2>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200",
                "hover:bg-primary/10",
                isActive
                  ? "bg-gradient-to-l from-primary/20 to-primary/5 text-primary shadow-sm border-r-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.labelAr}</span>
                <span className="text-xs opacity-70">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className={cn(
          "rounded-lg p-3",
          isAdmin ? "bg-primary/10" : "bg-blue-500/10"
        )}>
          <div className={cn(
            "flex items-center gap-2",
            isAdmin ? "text-primary" : "text-blue-600 dark:text-blue-400"
          )}>
            <Shield className="h-4 w-4" />
            <span className="text-xs font-medium">
              {isAdmin ? "وضع المسؤول النشط" : "وضع المراقب النشط"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAdmin ? "Admin Mode Active" : "Moderator Mode Active"}
          </p>
        </div>
      </div>
    </aside>
  );
}
