import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CalendarPopover } from "./CalendarPopover";

interface MealsHeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

function formatKoreanDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

export function MealsHeader({ selectedDate, onDateChange }: MealsHeaderProps) {
  const dateLabel = isToday(selectedDate)
    ? "오늘"
    : formatKoreanDate(selectedDate);

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold">식단</h1>
        <p className="text-sm text-muted-foreground">{dateLabel}</p>
      </div>
      <CalendarPopover selectedDate={selectedDate} onDateChange={onDateChange}>
        <Button variant="outline" size="icon" className="rounded-full">
          <CalendarIcon className="h-4 w-4" />
          <span className="sr-only">날짜 선택</span>
        </Button>
      </CalendarPopover>
    </header>
  );
}
