import { useMemo, useState } from "react";
import { CalendarIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricEntry, MetricType } from "@/domain/metrics/types";

interface HistoryListProps {
  entries: MetricEntry[];
  type: MetricType;
  unit: string;
  onDelete: (entry: MetricEntry) => void;
  isDeleting: boolean;
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLabel(dateStr: string): string {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (dateStr === today) return "오늘";
  if (dateStr === yesterday) return "어제";

  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

const INITIAL_DISPLAY_COUNT = 5;

export function HistoryList({
  entries,
  type,
  unit,
  onDelete,
  isDeleting,
}: HistoryListProps) {
  const [showAll, setShowAll] = useState(false);

  // Sort entries by date descending (newest first)
  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
    );
  }, [entries]);

  // Calculate change from previous entry
  const getChangeFromPrevious = (index: number): number | null => {
    if (index >= sortedEntries.length - 1) return null;
    const current = sortedEntries[index];
    const previous = sortedEntries[index + 1];
    return Number((current.value - previous.value).toFixed(1));
  };

  const displayedEntries = showAll
    ? sortedEntries
    : sortedEntries.slice(0, INITIAL_DISPLAY_COUNT);

  const hasMore = sortedEntries.length > INITIAL_DISPLAY_COUNT;

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">기록</h3>
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {showAll ? "접기" : "모두 보기"}
          </button>
        )}
      </div>

      <Card>
        <CardHeader className="sr-only">
          <CardTitle>기록 목록</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {displayedEntries.map((entry, index) => {
            const change = getChangeFromPrevious(index);
            const isToday = entry.date === getTodayDateString();

            return (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      isToday
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {formatDateLabel(entry.date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(entry.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold">
                      {entry.value} {unit}
                    </p>
                    {change !== null && change !== 0 && (
                      <p
                        className={`text-xs font-medium ${
                          type === "weight"
                            ? change < 0
                              ? "text-green-500"
                              : "text-red-500"
                            : change > 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {change > 0 ? "+" : ""}
                        {change} {unit}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(entry)}
                    disabled={isDeleting}
                    className="shrink-0"
                  >
                    <Trash2Icon className="text-muted-foreground" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
