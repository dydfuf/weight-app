import { useMemo } from "react";
import { Link } from "react-router";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetricEntriesByType } from "@/features/metrics/queries";

export function WeightTrendCard() {
  const { data: weightEntries = [], isLoading } =
    useMetricEntriesByType("weight");

  // Get last 10 entries for sparkline
  const chartData = useMemo(() => {
    const sorted = [...weightEntries].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    return sorted.slice(-10).map((entry) => ({
      date: entry.date,
      value: entry.value,
    }));
  }, [weightEntries]);

  // Calculate week change
  const weekChange = useMemo(() => {
    if (chartData.length < 2) return null;

    const latest = chartData[chartData.length - 1];
    // Find entry from ~7 days ago
    const targetDate = new Date(latest.date);
    targetDate.setDate(targetDate.getDate() - 7);
    const targetDateStr = targetDate.toISOString().split("T")[0];

    // Find closest entry to 7 days ago
    let closest = chartData[0];
    for (const entry of chartData) {
      if (entry.date <= targetDateStr) {
        closest = entry;
      }
    }

    if (closest.date === latest.date) return null;

    const diff = Number((latest.value - closest.value).toFixed(1));
    return diff;
  }, [chartData]);

  const latestWeight =
    chartData.length > 0 ? chartData[chartData.length - 1] : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            체중 트렌드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-16 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!latestWeight) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            체중 트렌드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              기록된 체중이 없습니다.
            </p>
            <Button asChild size="sm">
              <Link to="/app/progress?add=1&type=weight">입력하기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          체중 트렌드
        </CardTitle>
        <Link
          to="/app/progress"
          className="text-xs font-medium text-primary hover:underline"
        >
          기록 보기
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">현재 체중</span>
            <span className="text-2xl font-bold">
              {latestWeight.value}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                kg
              </span>
            </span>
            {weekChange !== null && (
              <span
                className={`mt-1 flex items-center text-xs font-medium ${
                  weekChange < 0
                    ? "text-green-500"
                    : weekChange > 0
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {weekChange < 0 ? (
                  <ArrowDown className="mr-0.5 h-3 w-3" />
                ) : weekChange > 0 ? (
                  <ArrowUp className="mr-0.5 h-3 w-3" />
                ) : null}
                {Math.abs(weekChange)} kg this week
              </span>
            )}
          </div>

          {/* Sparkline */}
          {chartData.length >= 2 && (
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} hide />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
