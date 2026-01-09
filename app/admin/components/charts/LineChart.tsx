"use client";

import {
  LineChart as RechartsLineChart,
  Line,
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

interface LineChartProps {
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

export function LineChart({
  data,
  title,
  isRTL = true,
  height = 300,
  color,
  showGrid = true,
  valueFormatter,
}: LineChartProps) {
  const colors = getChartColors();
  const lineColor = color || colors.primary;

  // For RTL, reverse the data array
  const chartData = isRTL ? [...data].reverse() : data;

  return (
    <div className="w-full">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={chartData}
          margin={{ top: 5, right: isRTL ? 5 : 20, left: isRTL ? 20 : 5, bottom: 5 }}
        >
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
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ fill: lineColor, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
