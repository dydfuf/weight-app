import { useMemo } from "react";

import { cn } from "@/lib/utils";

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

interface DayInfo {
  date: string;
  dayLabel: string;
  dayNumber: number;
  isToday: boolean;
}

function getWeekDays(centerDate: string): DayInfo[] {
  const center = new Date(centerDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
  const days: DayInfo[] = [];

  // Get 3 days before and 3 days after the center date (7 days total)
  for (let i = -3; i <= 3; i++) {
    const d = new Date(center);
    d.setDate(center.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    days.push({
      date: dateStr,
      dayLabel: dayLabels[d.getDay()],
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
    });
  }

  return days;
}

export function DateNavigator({
  selectedDate,
  onDateChange,
}: DateNavigatorProps) {
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      {weekDays.map((day) => {
        const isSelected = day.date === selectedDate;

        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onDateChange(day.date)}
            className={cn(
              "flex h-14 min-w-14 shrink-0 flex-col items-center justify-center rounded-xl border transition-all",
              isSelected
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:bg-muted",
              day.isToday && !isSelected && "border-primary/50"
            )}
          >
            <span className="text-xs font-medium">{day.dayLabel}</span>
            <span className="text-sm font-bold">{day.dayNumber}</span>
          </button>
        );
      })}
    </div>
  );
}
