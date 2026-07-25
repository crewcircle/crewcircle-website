"use client";

import { useMemo } from "react";

interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

interface SeriesDatum {
  date: string;
  [key: string]: string | number;
}

interface CostChartProps {
  title: string;
  data: BarDatum[];
  type?: "bar" | "pie";
  valueLabel?: string;
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
];

/**
 * Simple chart component using pure CSS/SVG — no external chart library needed.
 * For full recharts integration, swap this out with the recharts version below.
 */
export function CostChart({
  title,
  data,
  type = "bar",
  valueLabel = "Cost",
}: CostChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-4 text-center text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (type === "pie") {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-4 space-y-2">
          {data.map((d, i) => {
            const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
            return (
              <div key={d.label} className="flex items-center gap-2 text-sm">
                <div
                  className="h-3 w-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: d.color ?? COLORS[i % COLORS.length] }}
                />
                <span className="flex-1 text-gray-600">{d.label}</span>
                <span className="font-medium text-gray-900">
                  ${d.value.toFixed(2)}
                </span>
                <span className="w-10 text-right text-xs text-gray-400">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Bar chart
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-4 space-y-2">
        {data.map((d, i) => {
          const width = ((d.value / maxValue) * 100).toFixed(0);
          return (
            <div key={d.label} className="flex items-center gap-2 text-sm">
              <span className="w-24 flex-shrink-0 truncate text-gray-600">
                {d.label}
              </span>
              <div className="flex-1">
                <div
                  className="h-5 rounded-sm transition-all"
                  style={{
                    width: `${width}%`,
                    backgroundColor: d.color ?? COLORS[i % COLORS.length],
                    minWidth: d.value > 0 ? "4px" : "0",
                  }}
                />
              </div>
              <span className="w-20 text-right font-medium text-gray-900">
                ${d.value.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Line-chart-style component showing daily trends.
 * Uses a simple SVG-based sparkline.
 */
interface TrendChartProps {
  title: string;
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
  valueLabel?: string;
}

export function TrendChart({
  title,
  data,
  color = "#3b82f6",
  height = 60,
}: TrendChartProps) {
  if (data.length < 2) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-4 text-center text-sm text-gray-400">
          Not enough data for trend
        </p>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 0.01);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const width = data.length - 1;

  const points = data
    .map((d, i) => {
      const x = (i / width) * 100;
      const y = 100 - ((d.value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span className="text-sm font-semibold text-gray-900">
          ${total.toFixed(2)}
        </span>
      </div>
      <svg
        viewBox={`0 0 100 100`}
        preserveAspectRatio="none"
        className="mt-3 w-full"
        style={{ height }}
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Area fill */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={color}
          fillOpacity="0.1"
        />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>{data[0]?.date ?? ""}</span>
        <span>{data[data.length - 1]?.date ?? ""}</span>
      </div>
    </div>
  );
}
