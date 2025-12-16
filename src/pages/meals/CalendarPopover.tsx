import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface CalendarPopoverProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  children: React.ReactNode;
}

export function CalendarPopover({
  selectedDate,
  onDateChange,
  children,
}: CalendarPopoverProps) {
  const [open, setOpen] = useState(false);

  const selectedDateObj = new Date(selectedDate);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = date.toISOString().split("T")[0];
      onDateChange(dateStr);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={selectedDateObj}
          onSelect={handleSelect}
          defaultMonth={selectedDateObj}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
