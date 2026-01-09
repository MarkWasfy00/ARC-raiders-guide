"use client";

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  formatChartDate,
  formatArabicNumbers,
  formatEnglishNumbers,
  getChartColors,
} from "@/lib/utils/chart-formatters";

interface AreaChartProps {
  data: Array<{ date: string; value: number }>;
  title?: string;
  isRTL?: boolean;
  height?: number;
  color?: string;
  showGrid?: boolean;
  valueFormatter?: (value: number) => string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  isRTL,
  valueFormatter,
}: {
  active?: boolean;
  payload?: any;
  label?: string;
  isRTL?: boolean;
  valueFormatter?: (value: number) => string;
}) => {
  if (active && payload && payload.length) {
    const value = payload[0].value as number;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="text-sm text-muted-foreground">
          {formatChartDate(label || "", isRTL)}
        </p>
        <p className="text-lg font-semibold text-foreground">
          {valueFormatter
            ? valueFormatter(value)
            : isRTL
            ? formatArabicNumbers(value)
            : formatEnglishNumbers(value)}
        </p>
      </div>
    );
  }
  return null;
};

export function AreaChart({
  data,
  title,
  isRTL = true,
  height = 300,
  color,
  showGrid = true,
  valueFormatter,
}: AreaChartProps) {
  const colors = getChartColors();
  const areaColor = color || colors.primary;

  // For RTL, reverse the data array
  const chartData = isRTL ? [...data].reverse() : data;

  return (
    <div className="w-full">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={chartData}
          margin={{ top: 5, right: isRTL ? 5 : 20, left: isRTL ? 20 : 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={areaColor} stopOpacity={0.8} />
              <stop offset="100%" stopColor={areaColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          )}
          <XAxis
            dataKey="date"
            tickFormatter={(value) => formatChartDate(value, isRTL)}
            stroke={colors.muted}
            reversed={isRTL}
            style={{
              fontSize: "12px",
              fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
            }}
          />
          <YAxis
            tickFormatter={(value) =>
              valueFormatter
                ? valueFormatter(value)
                : isRTL
                ? formatArabicNumbers(value)
                : formatEnglishNumbers(value)
            }
            stroke={colors.muted}
            orientation={isRTL ? "right" : "left"}
            style={{
              fontSize: "12px",
              fontFamily: isRTL ? "Cairo, sans-serif" : "inherit",
            }}
          />
          <Tooltip
            content={
              <CustomTooltip
                isRTL={isRTL}
                valueFormatter={valueFormatter}
              />
            }
            cursor={{ stroke: colors.muted, strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={areaColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
