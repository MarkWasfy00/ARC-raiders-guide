"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  formatArabicNumbers,
  formatEnglishNumbers,
  getChartColors,
} from "@/lib/utils/chart-formatters";

interface BarChartProps {
  data: Array<{ label: string; value: number }>;
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
        <p className="text-sm text-muted-foreground">{label || ""}</p>
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

export function BarChart({
  data,
  title,
  isRTL = true,
  height = 300,
  color,
  showGrid = true,
  valueFormatter,
}: BarChartProps) {
  const colors = getChartColors();
  const barColor = color || colors.primary;

  // For RTL, reverse the data array
  const chartData = isRTL ? [...data].reverse() : data;

  return (
    <div className="w-full">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={chartData}
          margin={{ top: 5, right: isRTL ? 5 : 20, left: isRTL ? 20 : 5, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          )}
          <XAxis
            dataKey="label"
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
            cursor={{ fill: colors.grid }}
          />
          <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
