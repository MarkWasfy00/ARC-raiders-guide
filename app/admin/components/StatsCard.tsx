"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatArabicNumbers,
  getTrendPercentage,
  formatPercentage,
  getTrendColor,
} from "@/lib/utils/chart-formatters";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  titleAr: string;
  value: number;
  previousValue?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function StatsCard({
  title,
  titleAr,
  value,
  previousValue,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  valueFormatter,
  className,
}: StatsCardProps) {
  const formattedValue = valueFormatter
    ? valueFormatter(value)
    : formatArabicNumbers(value);

  const hasTrend = previousValue !== undefined;
  const trendPercentage = hasTrend
    ? getTrendPercentage(value, previousValue)
    : 0;
  const trendColor = hasTrend ? getTrendColor(value, previousValue) : undefined;

  const TrendIcon =
    trendPercentage > 0
      ? TrendingUp
      : trendPercentage < 0
      ? TrendingDown
      : Minus;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border bg-gradient-to-br from-card to-muted/20 transition-all hover:shadow-lg",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          <div className="flex flex-col gap-1">
            <span>{titleAr}</span>
            <span className="text-xs opacity-70">{title}</span>
          </div>
        </CardTitle>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            iconBgColor
          )}
        >
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-foreground">
            {formattedValue}
          </div>
          {hasTrend && (
            <div
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: trendColor }}
            >
              <TrendIcon className="h-4 w-4" />
              <span>{formatPercentage(trendPercentage)}</span>
            </div>
          )}
        </div>
        {hasTrend && (
          <p className="mt-2 text-xs text-muted-foreground">
            من الأسبوع الماضي (from last week)
          </p>
        )}
      </CardContent>

      {/* Decorative gradient */}
      <div
        className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        style={{ opacity: 0.5 }}
      />
    </Card>
  );
}
