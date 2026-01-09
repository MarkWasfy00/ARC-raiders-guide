"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Download,
  Users,
  Settings,
  Activity,
  FileText,
  Plus,
} from "lucide-react";

interface QuickAction {
  label: string;
  labelAr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "outline" | "secondary";
}

const quickActions: QuickAction[] = [
  {
    label: "Export Users",
    labelAr: "تصدير المستخدمين",
    href: "/api/admin/users/export",
    icon: Download,
    variant: "outline",
  },
  {
    label: "View All Users",
    labelAr: "عرض جميع المستخدمين",
    href: "/admin/users",
    icon: Users,
    variant: "outline",
  },
  {
    label: "Activity Logs",
    labelAr: "سجل النشاطات",
    href: "/admin/activity-logs",
    icon: Activity,
    variant: "outline",
  },
  {
    label: "Create Guide",
    labelAr: "إنشاء دليل",
    href: "/admin/guides?action=create",
    icon: Plus,
    variant: "outline",
  },
  {
    label: "System Settings",
    labelAr: "إعدادات النظام",
    href: "/admin/settings",
    icon: Settings,
    variant: "default",
  },
];

export function QuickActionsPanel() {
  const handleExport = async (href: string) => {
    if (href.includes("export")) {
      try {
        const response = await fetch(href);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } catch (error) {
        console.error("Export failed:", error);
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {quickActions.map((action) => {
        const Icon = action.icon;
        const isExport = action.href.includes("export");

        if (isExport) {
          return (
            <Button
              key={action.href}
              variant={action.variant}
              className="flex items-center gap-2"
              onClick={() => handleExport(action.href)}
            >
              <Icon className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{action.labelAr}</span>
                <span className="text-xs opacity-70">{action.label}</span>
              </div>
            </Button>
          );
        }

        return (
          <Link key={action.href} href={action.href}>
            <Button variant={action.variant} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{action.labelAr}</span>
                <span className="text-xs opacity-70">{action.label}</span>
              </div>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
