import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

/**
 * Format time-series data for Recharts
 */
export function formatTimeSeriesData(
  data: any[],
  dateField: string,
  valueField: string
) {
  return data.map((item) => ({
    date: item[dateField],
    value: item[valueField],
  }));
}

/**
 * Format numbers to Arabic locale
 */
export function formatArabicNumbers(num: number): string {
  return num.toLocaleString("ar-SA");
}

/**
 * Format numbers to English locale (with commas)
 */
export function formatEnglishNumbers(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Format date for chart axis (short format)
 */
export function formatChartDate(dateString: string, isRTL: boolean = true): string {
  try {
    const date = parseISO(dateString);
    if (isRTL) {
      return format(date, "d MMM", { locale: ar });
    }
    return format(date, "MMM d");
  } catch {
    return dateString;
  }
}

/**
 * Format full date for tooltips
 */
export function formatFullDate(dateString: string, isRTL: boolean = true): string {
  try {
    const date = parseISO(dateString);
    if (isRTL) {
      return format(date, "d MMMM yyyy", { locale: ar });
    }
    return format(date, "MMMM d, yyyy");
  } catch {
    return dateString;
  }
}

/**
 * Get theme-consistent chart colors
 */
export function getChartColors() {
  return {
    primary: "hsl(25 95% 53%)", // Orange primary
    secondary: "hsl(25 80% 60%)", // Lighter orange
    tertiary: "hsl(25 70% 70%)", // Even lighter orange
    success: "hsl(142 76% 36%)", // Green
    danger: "hsl(0 72% 51%)", // Red
    warning: "hsl(48 96% 53%)", // Yellow
    muted: "hsl(0 0% 45%)", // Gray
    background: "hsl(0 0% 7%)", // Dark background
    foreground: "hsl(0 0% 98%)", // Light text
    border: "hsl(0 0% 14.9%)", // Border color
    grid: "hsl(0 0% 20%)", // Grid lines
  };
}

/**
 * Calculate trend percentage between two values
 */
export function getTrendPercentage(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Get trend indicator (up/down/neutral)
 */
export function getTrendIndicator(
  current: number,
  previous: number
): "up" | "down" | "neutral" {
  const percentage = getTrendPercentage(current, previous);
  if (percentage > 0) return "up";
  if (percentage < 0) return "down";
  return "neutral";
}

/**
 * Format percentage with sign
 */
export function formatPercentage(percentage: number, isRTL: boolean = true): string {
  const sign = percentage > 0 ? "+" : "";
  const formatted = isRTL
    ? formatArabicNumbers(Math.abs(percentage))
    : formatEnglishNumbers(Math.abs(percentage));
  return `${sign}${formatted}%`;
}

/**
 * Get color for trend
 */
export function getTrendColor(
  current: number,
  previous: number
): string {
  const indicator = getTrendIndicator(current, previous);
  const colors = getChartColors();

  if (indicator === "up") return colors.success;
  if (indicator === "down") return colors.danger;
  return colors.muted;
}

/**
 * Shorten large numbers (1000 -> 1K, 1000000 -> 1M)
 */
export function shortenNumber(num: number, isRTL: boolean = true): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}${isRTL ? "م" : "M"}`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}${isRTL ? "ك" : "K"}`;
  }
  return isRTL ? formatArabicNumbers(num) : formatEnglishNumbers(num);
}

/**
 * Get gradient ID for chart fills
 */
export function getGradientId(chartId: string): string {
  return `gradient-${chartId}`;
}

/**
 * Create gradient definition for Recharts AreaChart
 */
export function createGradientDef(id: string, color: string) {
  return {
    id,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1",
    stops: [
      { offset: "0%", stopColor: color, stopOpacity: 0.8 },
      { offset: "100%", stopColor: color, stopOpacity: 0.1 },
    ],
  };
}

/**
 * Format data for pie/donut charts
 */
export function formatPieData(
  data: Array<{ label: string; value: number }>,
  colorPalette?: string[]
) {
  const colors = colorPalette || [
    getChartColors().primary,
    getChartColors().secondary,
    getChartColors().tertiary,
    getChartColors().success,
    getChartColors().danger,
    getChartColors().warning,
  ];

  return data.map((item, index) => ({
    name: item.label,
    value: item.value,
    fill: colors[index % colors.length],
  }));
}

/**
 * Calculate data range for chart domain
 */
export function getChartDomain(data: number[], padding: number = 0.1) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  return {
    min: Math.floor(min - range * padding),
    max: Math.ceil(max + range * padding),
  };
}

/**
 * Group data by time period (day, week, month)
 */
export function groupDataByPeriod(
  data: Array<{ date: string; value: number }>,
  period: "day" | "week" | "month"
) {
  const grouped: Record<string, number> = {};

  data.forEach((item) => {
    let key: string;
    const date = parseISO(item.date);

    if (period === "day") {
      key = format(date, "yyyy-MM-dd");
    } else if (period === "week") {
      key = format(date, "yyyy-'W'ww");
    } else {
      key = format(date, "yyyy-MM");
    }

    grouped[key] = (grouped[key] || 0) + item.value;
  });

  return Object.entries(grouped).map(([date, value]) => ({
    date,
    value,
  }));
}

/**
 * Get activity type icon and color
 */
export function getActivityTypeStyle(type: string): {
  icon: string;
  color: string;
  bgColor: string;
} {
  const colors = getChartColors();

  const styles: Record<
    string,
    { icon: string; color: string; bgColor: string }
  > = {
    USER_REGISTERED: {
      icon: "UserPlus",
      color: colors.success,
      bgColor: "bg-green-500/10",
    },
    USER_LOGIN: {
      icon: "LogIn",
      color: colors.muted,
      bgColor: "bg-gray-500/10",
    },
    USER_BANNED: {
      icon: "Ban",
      color: colors.danger,
      bgColor: "bg-red-500/10",
    },
    USER_UNBANNED: {
      icon: "CheckCircle",
      color: colors.success,
      bgColor: "bg-green-500/10",
    },
    LISTING_CREATED: {
      icon: "ShoppingCart",
      color: colors.primary,
      bgColor: "bg-orange-500/10",
    },
    TRADE_COMPLETED: {
      icon: "Handshake",
      color: colors.success,
      bgColor: "bg-green-500/10",
    },
    GUIDE_CREATED: {
      icon: "BookOpen",
      color: colors.primary,
      bgColor: "bg-orange-500/10",
    },
    MAP_MARKER_ADDED: {
      icon: "MapPin",
      color: colors.warning,
      bgColor: "bg-yellow-500/10",
    },
    ADMIN_ACTION: {
      icon: "Shield",
      color: colors.danger,
      bgColor: "bg-red-500/10",
    },
  };

  return (
    styles[type] || {
      icon: "Activity",
      color: colors.muted,
      bgColor: "bg-gray-500/10",
    }
  );
}
