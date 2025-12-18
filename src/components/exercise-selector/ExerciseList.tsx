import { Loader2, SearchX } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Exercise } from "@/domain/exercises/types";
import { ExerciseCard } from "./ExerciseCard";

export type ExerciseListItem =
  | { kind: "exercise"; exercise: Exercise }
  | { kind: "placeholder"; id: string; name: string };

interface ExerciseListProps {
  items: ExerciseListItem[];
  isLoading?: boolean;
  onSelect: (exercise: Exercise) => void;
  emptyMessage?: string;
  className?: string;
}

export function ExerciseList({
  items,
  isLoading = false,
  onSelect,
  emptyMessage = "운동을 찾을 수 없습니다",
  className,
}: ExerciseListProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 py-12 text-center",
          className
        )}
      >
        <SearchX className="size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        if (item.kind === "exercise") {
          return (
            <ExerciseCard
              key={item.exercise.id}
              exercise={item.exercise}
              onSelect={onSelect}
            />
          );
        }

        return (
          <div
            key={`missing:${item.id}`}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left opacity-70"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
              <span className="text-xs font-medium text-muted-foreground">
                N/A
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                운동 정보를 불러오지 못했습니다
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
