import { useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import type { MetricEntry, MetricType } from "@/domain/metrics/types";

const PERIOD_OPTIONS = ["1W", "1M", "3M", "1Y", "All"] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

const PERIOD_DAYS: Record<Period, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "1Y": 365,
  All: Infinity,
};

interface MetricChartProps {
  entries: MetricEntry[];
  latest: MetricEntry | null | undefined;
  type: MetricType;
  unit: string;
  label: string;
}

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function MetricChart({
  entries,
  latest,
  type,
  unit,
  label,
}: MetricChartProps) {
  const [period, setPeriod] = useState<Period>("3M");

  // Filter entries by period and sort by date ascending for chart
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const days = PERIOD_DAYS[period];

    const cutoff = new Date();
    cutoff.setDate(now.getDate() - days);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const filtered =
      days === Infinity ? entries : entries.filter((e) => e.date >= cutoffStr);

    // Sort by date ascending for chart
    return [...filtered].sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, period]);

  // Chart data - aggregate by date (take latest per day)
  const chartData = useMemo(() => {
    const byDate = new Map<string, number>();

    for (const entry of filteredEntries) {
      // Take the latest entry for each date (higher createdAt)
      const existing = byDate.get(entry.date);
      if (existing === undefined) {
        byDate.set(entry.date, entry.value);
      }
    }

    return Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({
        date,
        label: formatShortDate(date),
        value,
      }));
  }, [filteredEntries]);

  // Calculate change from period start
  const periodChange = useMemo(() => {
    if (chartData.length < 2 || !latest) return null;

    const firstValue = chartData[0].value;
    const currentValue = latest.value;
    const diff = Number((currentValue - firstValue).toFixed(1));

    return diff;
  }, [chartData, latest]);

  // Determine Y-axis domain with some padding
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 1;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header with current value and change */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              현재 {label}
            </p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold tracking-tight">
                {latest ? latest.value : "-"}
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  {unit}
                </span>
              </p>
            </div>
          </div>

          {periodChange !== null && periodChange !== 0 && (
            <div
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${
                type === "weight"
                  ? periodChange < 0
                    ? "bg-green-500/10 text-green-500"
                    : "bg-red-500/10 text-red-500"
                  : periodChange < 0
                  ? "bg-red-500/10 text-red-500"
                  : "bg-green-500/10 text-green-500"
              }`}
            >
              {periodChange < 0 ? (
                <TrendingDown className="size-3" />
              ) : (
                <TrendingUp className="size-3" />
              )}
              {periodChange > 0 ? "+" : ""}
              {periodChange} {unit}
            </div>
          )}
        </div>

        {/* Period selector */}
        <div className="mb-4 flex justify-between rounded-lg bg-muted p-1">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                period === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chart */}
        {chartData.length >= 2 ? (
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id={`metricGradient-${type}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  dy={8}
                  interval="preserveStartEnd"
                />
                <YAxis hide domain={yDomain} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload as (typeof chartData)[0];
                    return (
                      <div className="rounded-lg border bg-popover px-2 py-1 text-xs shadow-md">
                        <p className="font-medium">{data.date}</p>
                        <p className="text-muted-foreground">
                          {data.value} {unit}
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill={`url(#metricGradient-${type})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            차트를 표시하려면 2개 이상의 기록이 필요합니다
          </div>
        )}
      </CardContent>
    </Card>
  );
}
