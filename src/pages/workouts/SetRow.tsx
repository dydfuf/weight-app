import { useState, useEffect } from "react";
import { CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { WorkoutSet } from "@/domain/workouts/types";

interface SetRowProps {
  set: WorkoutSet;
  previousSet?: { weight: number; reps: number };
  onComplete: (setId: string, weight: number, reps: number) => void;
  isActive?: boolean;
}

export function SetRow({
  set,
  previousSet,
  onComplete,
  isActive = false,
}: SetRowProps) {
  const [weight, setWeight] = useState(set.weight?.toString() ?? "");
  const [reps, setReps] = useState(set.reps?.toString() ?? "");

  // Update local state when set changes
  useEffect(() => {
    setWeight(set.weight?.toString() ?? "");
    setReps(set.reps?.toString() ?? "");
  }, [set.weight, set.reps]);

  const handleComplete = () => {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 0;
    if (w > 0 && r > 0) {
      onComplete(set.id, w, r);
    }
  };

  const prevText = previousSet
    ? `${previousSet.weight}×${previousSet.reps}`
    : "-";

  return (
    <div
      className={cn(
        "grid grid-cols-[2rem_1fr_1fr_1fr_2.5rem] items-center gap-2 rounded-lg p-2 transition-colors",
        set.completed
          ? "bg-primary/5 border border-primary/20"
          : isActive
          ? "bg-muted/50 border border-primary border-l-4"
          : "hover:bg-muted/30"
      )}
    >
      {/* Set Number */}
      <span
        className={cn(
          "text-center text-sm font-bold",
          set.completed
            ? "text-primary"
            : isActive
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        {set.setIndex}
      </span>

      {/* Previous */}
      <span className="text-center text-xs font-mono text-muted-foreground">
        {prevText}
      </span>

      {/* Weight Input */}
      <Input
        type="number"
        inputMode="decimal"
        placeholder={previousSet?.weight?.toString() ?? "-"}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className={cn(
          "h-9 text-center font-bold",
          set.completed && "border-primary/30"
        )}
        disabled={set.completed}
      />

      {/* Reps Input */}
      <Input
        type="number"
        inputMode="numeric"
        placeholder={previousSet?.reps?.toString() ?? "-"}
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        className={cn(
          "h-9 text-center font-bold",
          set.completed && "border-primary/30"
        )}
        disabled={set.completed}
      />

      {/* Complete Button */}
      <Button
        type="button"
        size="icon"
        variant={set.completed ? "default" : "outline"}
        className={cn(
          "h-8 w-8",
          set.completed && "bg-primary hover:bg-primary/90"
        )}
        onClick={handleComplete}
        disabled={set.completed}
      >
        <CheckIcon className="h-4 w-4" />
        <span className="sr-only">완료</span>
      </Button>
    </div>
  );
}

interface NewSetRowProps {
  setIndex: number;
  previousSet?: { weight: number; reps: number };
  onAdd: (weight: number, reps: number) => void;
  isPending?: boolean;
}

export function NewSetRow({
  setIndex,
  previousSet,
  onAdd,
  isPending = false,
}: NewSetRowProps) {
  const [weight, setWeight] = useState(previousSet?.weight?.toString() ?? "");
  const [reps, setReps] = useState(previousSet?.reps?.toString() ?? "");

  const handleAdd = () => {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 0;
    if (w > 0 && r > 0) {
      onAdd(w, r);
      setWeight("");
      setReps("");
    }
  };

  const prevText = previousSet
    ? `${previousSet.weight}×${previousSet.reps}`
    : "-";

  return (
    <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2.5rem] items-center gap-2 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30 p-2">
      {/* Set Number */}
      <span className="text-center text-sm font-bold text-muted-foreground">
        {setIndex}
      </span>

      {/* Previous */}
      <span className="text-center text-xs font-mono text-muted-foreground">
        {prevText}
      </span>

      {/* Weight Input */}
      <Input
        type="number"
        inputMode="decimal"
        placeholder={previousSet?.weight?.toString() ?? "kg"}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="h-9 text-center font-bold"
        autoFocus
      />

      {/* Reps Input */}
      <Input
        type="number"
        inputMode="numeric"
        placeholder={previousSet?.reps?.toString() ?? "회"}
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        className="h-9 text-center font-bold"
      />

      {/* Add Button */}
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-8 w-8"
        onClick={handleAdd}
        disabled={isPending}
      >
        <CheckIcon className="h-4 w-4" />
        <span className="sr-only">추가</span>
      </Button>
    </div>
  );
}
