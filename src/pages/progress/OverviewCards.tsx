import { useMemo } from "react";
import { FlagIcon, CalendarIcon, TrendingDownIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { Goals } from "@/domain/goals/types";
import type { MetricEntry, MetricType } from "@/domain/metrics/types";

interface OverviewCardsProps {
  entries: MetricEntry[];
  latest: MetricEntry | null | undefined;
  goals: Goals | null | undefined;
  type: MetricType;
  unit: string;
  label: string;
}

export function OverviewCards({
  entries,
  latest,
  goals,
  type,
  unit,
  label,
}: OverviewCardsProps) {
  // Sort entries by date ascending
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  // Calculate goal progress (only for weight)
  const goalProgress = useMemo(() => {
    if (type !== "weight" || !goals?.weightGoal || !latest) return null;

    const goalWeight = goals.weightGoal;
    const currentWeight = latest.value;

    // Find first entry to calculate starting point
    const firstEntry = sortedEntries[0];
    if (!firstEntry) return null;

    const startWeight = firstEntry.value;
    const totalToLose = startWeight - goalWeight;
    const lostSoFar = startWeight - currentWeight;
    const remaining = currentWeight - goalWeight;

    // Progress percentage (capped at 100%)
    const progress =
      totalToLose > 0
        ? Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100))
        : 0;

    return {
      goalWeight,
      remaining: Math.abs(remaining),
      progress,
      isAboveGoal: remaining > 0,
    };
  }, [type, goals, latest, sortedEntries]);

  // Calculate total change from first entry
  const totalChange = useMemo(() => {
    if (!latest || sortedEntries.length < 2) return null;

    const firstEntry = sortedEntries[0];
    const change = Number((latest.value - firstEntry.value).toFixed(1));
    const startDate = firstEntry.date;

    return { change, startDate };
  }, [latest, sortedEntries]);

  // Calculate month-over-month change
  const monthChange = useMemo(() => {
    if (!latest || sortedEntries.length < 2) return null;

    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 1);
    const monthAgoStr = monthAgo.toISOString().split("T")[0];

    // Find the closest entry to a month ago
    let closestEntry: MetricEntry | null = null;
    for (const entry of sortedEntries) {
      if (entry.date <= monthAgoStr) {
        closestEntry = entry;
      }
    }

    if (!closestEntry) return null;

    const change = Number((latest.value - closestEntry.value).toFixed(1));
    return change;
  }, [latest, sortedEntries]);

  // Format start date
  const formatStartDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  return (
    <div className="space-y-3">
      <h3 className="px-1 text-sm font-semibold">개요</h3>
      <div className="grid grid-cols-2 gap-3">
        {/* Goal Card - only for weight */}
        {type === "weight" && goalProgress && (
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="absolute right-0 top-0 p-3 opacity-10">
                <FlagIcon className="size-8" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                목표 체중
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {goalProgress.goalWeight}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {unit}
                </span>
              </p>
              <div className="mt-2 text-xs font-medium text-muted-foreground">
                {goalProgress.isAboveGoal
                  ? `${goalProgress.remaining} ${unit} 남음`
                  : "목표 달성!"}
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${goalProgress.progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total Change Card */}
        {totalChange && (
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="absolute right-0 top-0 p-3 opacity-10">
                <CalendarIcon className="size-8" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                총 변화
              </p>
              <p
                className={`text-2xl font-bold tracking-tight ${
                  type === "weight"
                    ? totalChange.change < 0
                      ? "text-green-500"
                      : totalChange.change > 0
                      ? "text-red-500"
                      : ""
                    : totalChange.change > 0
                    ? "text-green-500"
                    : totalChange.change < 0
                    ? "text-red-500"
                    : ""
                }`}
              >
                {totalChange.change > 0 ? "+" : ""}
                {totalChange.change}
                <span
                  className={`ml-1 text-sm font-normal ${
                    type === "weight"
                      ? totalChange.change < 0
                        ? "text-green-500/70"
                        : totalChange.change > 0
                        ? "text-red-500/70"
                        : "text-muted-foreground"
                      : totalChange.change > 0
                      ? "text-green-500/70"
                      : totalChange.change < 0
                      ? "text-red-500/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {unit}
                </span>
              </p>
              <div className="mt-2 text-xs font-medium text-muted-foreground">
                {formatStartDate(totalChange.startDate)} 부터
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Metric with Month Change */}
        {monthChange !== null && (
          <Card
            className={`relative overflow-hidden ${
              !goalProgress && !totalChange ? "col-span-2" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {latest?.value ?? "-"}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {unit}
                    </span>
                  </p>
                </div>
                <div
                  className={`rounded-lg p-2 ${
                    type === "weight"
                      ? monthChange < 0
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                      : monthChange > 0
                      ? "bg-green-500/10"
                      : "bg-red-500/10"
                  }`}
                >
                  <TrendingDownIcon
                    className={`size-5 ${
                      type === "weight"
                        ? monthChange < 0
                          ? "text-green-500"
                          : "rotate-180 text-red-500"
                        : monthChange > 0
                        ? "rotate-180 text-green-500"
                        : "text-red-500"
                    }`}
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    type === "weight"
                      ? monthChange < 0
                        ? "bg-green-500/20 text-green-500"
                        : monthChange > 0
                        ? "bg-red-500/20 text-red-500"
                        : "bg-muted text-muted-foreground"
                      : monthChange > 0
                      ? "bg-green-500/20 text-green-500"
                      : monthChange < 0
                      ? "bg-red-500/20 text-red-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {monthChange > 0 ? "+" : ""}
                  {monthChange}
                  {unit}
                </span>
                <span className="text-xs text-muted-foreground">
                  지난달 대비
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!goalProgress && !totalChange && monthChange === null && (
          <Card className="col-span-2">
            <CardContent className="flex h-24 items-center justify-center p-4">
              <p className="text-sm text-muted-foreground">
                통계를 표시하려면 더 많은 기록이 필요합니다
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
