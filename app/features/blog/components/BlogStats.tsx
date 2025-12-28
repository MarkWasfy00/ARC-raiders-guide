"use client";

import { FileText, Eye, MessageSquare, FolderOpen } from "lucide-react";

interface BlogStatsProps {
  totalBlogs: number;
  totalViews: number;
  totalComments: number;
  totalCategories: number;
}

export function BlogStats({
  totalBlogs,
  totalViews,
  totalComments,
  totalCategories,
}: BlogStatsProps) {
  const stats = [
    {
      label: "إجمالي المقالات",
      value: totalBlogs,
      icon: FileText,
      color: "hsl(25 95% 53%)",
      gradient: "from-orange-500/20 to-orange-600/20",
    },
    {
      label: "إجمالي المشاهدات",
      value: totalViews.toLocaleString("ar-EG"),
      icon: Eye,
      color: "hsl(200 95% 53%)",
      gradient: "from-blue-500/20 to-blue-600/20",
    },
    {
      label: "إجمالي التعليقات",
      value: totalComments,
      icon: MessageSquare,
      color: "hsl(140 95% 53%)",
      gradient: "from-green-500/20 to-green-600/20",
    },
    {
      label: "الفئات",
      value: totalCategories,
      icon: FolderOpen,
      color: "hsl(280 95% 53%)",
      gradient: "from-purple-500/20 to-purple-600/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="relative group overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            {/* Content */}
            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <div
                className="p-3 rounded-lg transition-all duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${stat.color}20`,
                }}
              >
                <Icon className="h-6 w-6" style={{ color: stat.color }} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-2xl"
              style={{ backgroundColor: stat.color }}
            />
          </div>
        );
      })}
    </div>
  );
}
