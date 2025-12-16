import { useMemo } from "react";
import { Link } from "react-router";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGoals } from "@/features/goals/queries";
import { useFoodEntriesByDateRange } from "@/features/meals/queries";

function getDateRange(daysBack: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - daysBack);

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return weekdays[date.getDay()];
}

export function CaloriesHeroCard() {
  const { data: goals } = useGoals();

  // Last 7 days
  const { startDate: last7Start, endDate: today } = getDateRange(6);
  // Previous week (8-14 days ago)
  const { startDate: prevWeekStart, endDate: prevWeekEnd } = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() - 7);
    const start = new Date();
    start.setDate(start.getDate() - 13);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, []);

  const { data: thisWeekEntries = [], isLoading: thisWeekLoading } =
    useFoodEntriesByDateRange(last7Start, today);
  const { data: prevWeekEntries = [] } = useFoodEntriesByDateRange(
    prevWeekStart,
    prevWeekEnd
  );

  // Aggregate by date for chart
  const chartData = useMemo(() => {
    const byDate = new Map<string, number>();

    // Initialize all 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      byDate.set(dateStr, 0);
    }

    // Sum calories per day
    for (const entry of thisWeekEntries) {
      const current = byDate.get(entry.date) ?? 0;
      byDate.set(entry.date, current + entry.calories);
    }

    return Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, calories]) => ({
        date,
        day: formatShortDate(date),
        calories,
      }));
  }, [thisWeekEntries]);

  // Today's total
  const todayTotal = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return thisWeekEntries
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + e.calories, 0);
  }, [thisWeekEntries]);

  // This week vs last week comparison
  const weekComparison = useMemo(() => {
    const thisWeekTotal = thisWeekEntries.reduce(
      (sum, e) => sum + e.calories,
      0
    );
    const prevWeekTotal = prevWeekEntries.reduce(
      (sum, e) => sum + e.calories,
      0
    );

    if (prevWeekTotal === 0) return null;

    const diff = ((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100;
    return Math.round(diff);
  }, [thisWeekEntries, prevWeekEntries]);

  const dailyCaloriesGoal = goals?.dailyCalories;
  const remaining = dailyCaloriesGoal
    ? dailyCaloriesGoal - todayTotal
    : undefined;

  if (thisWeekLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="h-40 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {remaining !== undefined && remaining >= 0
                ? "잔여 칼로리"
                : remaining !== undefined
                ? "초과 칼로리"
                : "오늘 섭취"}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">
                {remaining !== undefined
                  ? Math.abs(remaining).toLocaleString()
                  : todayTotal.toLocaleString()}
              </p>
              {dailyCaloriesGoal && (
                <p className="text-sm font-medium text-muted-foreground">
                  / {dailyCaloriesGoal.toLocaleString()} kcal
                </p>
              )}
            </div>
          </div>

          {weekComparison !== null && (
            <div
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${
                weekComparison > 0
                  ? "bg-red-500/10 text-red-500"
                  : weekComparison < 0
                  ? "bg-green-500/10 text-green-500"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {weekComparison > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : weekComparison < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : null}
              {weekComparison > 0 ? "+" : ""}
              {weekComparison}% vs 지난주
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="caloriesGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                dy={8}
              />
              <YAxis hide domain={[0, "auto"]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as (typeof chartData)[0];
                  return (
                    <div className="rounded-lg border bg-popover px-2 py-1 text-xs shadow-md">
                      <p className="font-medium">{data.date}</p>
                      <p className="text-muted-foreground">
                        {data.calories.toLocaleString()} kcal
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#caloriesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* CTA if no goal */}
        {!dailyCaloriesGoal && (
          <div className="mt-3 text-center">
            <Button asChild size="sm" variant="outline">
              <Link to="/app/settings">칼로리 목표 설정</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
