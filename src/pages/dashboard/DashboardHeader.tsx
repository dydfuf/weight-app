import { useUser } from "@clerk/react-router";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function formatKoreanDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  return `${month}월 ${day}일, ${weekday}요일`;
}

export function DashboardHeader() {
  const { isLoaded, isSignedIn, user } = useUser();

  const displayName =
    (isLoaded && isSignedIn && (user?.fullName || user?.firstName)) || "사용자";
  const imageUrl = isLoaded && isSignedIn ? user?.imageUrl : undefined;

  const today = new Date();
  const dateString = formatKoreanDate(today);

  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div
            className={cn(
              "grid size-10 place-items-center overflow-hidden rounded-full",
              "bg-muted text-sm font-semibold text-muted-foreground",
              "ring-2 ring-primary/30"
            )}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{getInitials(displayName)}</span>
            )}
          </div>
          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-primary" />
        </div>

        {/* Greeting */}
        <div>
          <p className="text-xs font-medium text-muted-foreground leading-none mb-1">
            {dateString}
          </p>
          <h2 className="text-lg font-bold leading-none tracking-tight">
            안녕하세요, {displayName}님
          </h2>
        </div>
      </div>

      {/* Notification button (UI only) */}
      <Button variant="outline" size="icon" className="rounded-full shrink-0">
        <Bell className="h-4 w-4" />
        <span className="sr-only">알림</span>
      </Button>
    </header>
  );
}
