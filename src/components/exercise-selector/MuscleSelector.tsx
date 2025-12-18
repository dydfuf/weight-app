import { useState } from "react";
import Model, { type IExerciseData, type Muscle, type IMuscleStats } from "react-body-highlighter";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MuscleTarget } from "@/domain/exercises/types";

/**
 * Mapping from react-body-highlighter muscle names to ExerciseDB target names
 */
const MUSCLE_TO_TARGET: Record<Muscle, MuscleTarget | undefined> = {
  chest: "pectorals",
  trapezius: "traps",
  "upper-back": "upper back",
  "lower-back": "spine",
  biceps: "biceps",
  triceps: "triceps",
  forearm: "forearms",
  "back-deltoids": "delts",
  "front-deltoids": "delts",
  abs: "abs",
  obliques: "serratus anterior",
  adductor: "adductors",
  abductors: "abductors",
  hamstring: "hamstrings",
  quadriceps: "quads",
  calves: "calves",
  gluteal: "glutes",
  head: undefined,
  neck: "levator scapulae",
  knees: undefined,
  "left-soleus": "calves",
  "right-soleus": "calves",
};

/**
 * Mapping from ExerciseDB target names to react-body-highlighter muscle names
 */
const TARGET_TO_MUSCLES: Partial<Record<MuscleTarget, Muscle[]>> = {
  pectorals: ["chest"],
  traps: ["trapezius"],
  "upper back": ["upper-back"],
  spine: ["lower-back"],
  biceps: ["biceps"],
  triceps: ["triceps"],
  forearms: ["forearm"],
  delts: ["front-deltoids", "back-deltoids"],
  abs: ["abs"],
  "serratus anterior": ["obliques"],
  adductors: ["adductor"],
  abductors: ["abductors"],
  hamstrings: ["hamstring"],
  quads: ["quadriceps"],
  calves: ["calves", "left-soleus", "right-soleus"],
  glutes: ["gluteal"],
  "levator scapulae": ["neck"],
  lats: ["upper-back"],
};

/**
 * Korean labels for muscle targets
 */
const TARGET_LABELS: Record<MuscleTarget, string> = {
  pectorals: "가슴",
  traps: "승모근",
  "upper back": "등 상부",
  spine: "허리",
  biceps: "이두",
  triceps: "삼두",
  forearms: "전완",
  delts: "어깨",
  abs: "복근",
  "serratus anterior": "전거근",
  adductors: "내전근",
  abductors: "외전근",
  hamstrings: "햄스트링",
  quads: "대퇴사두",
  calves: "종아리",
  glutes: "둔근",
  "levator scapulae": "목",
  lats: "광배근",
  "cardiovascular system": "심폐",
};

interface MuscleSelectorProps {
  selectedTargets: MuscleTarget[];
  onTargetSelect: (target: MuscleTarget) => void;
  onTargetDeselect: (target: MuscleTarget) => void;
  onClear?: () => void;
  className?: string;
}

export function MuscleSelector({
  selectedTargets,
  onTargetSelect,
  onTargetDeselect,
  onClear,
  className,
}: MuscleSelectorProps) {
  const [view, setView] = useState<"anterior" | "posterior">("anterior");

  // Convert selected targets to muscle data for highlighting
  const highlightData: IExerciseData[] = selectedTargets.flatMap((target) => {
    const muscles = TARGET_TO_MUSCLES[target] || [];
    if (muscles.length === 0) return [];
    return [{
      name: target,
      muscles: muscles,
    }];
  });

  const handleMuscleClick = (data: IMuscleStats) => {
    const muscleName = data.muscle;
    const target = MUSCLE_TO_TARGET[muscleName];

    if (!target) return;

    if (selectedTargets.includes(target)) {
      onTargetDeselect(target);
    } else {
      onTargetSelect(target);
    }
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* View toggle */}
      <div className="mb-3 flex gap-2">
        <Button
          type="button"
          variant={view === "anterior" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("anterior")}
        >
          전면
        </Button>
        <Button
          type="button"
          variant={view === "posterior" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("posterior")}
        >
          후면
        </Button>
      </div>

      {/* Body model */}
      <div className="relative flex items-center justify-center">
        <Model
          data={highlightData}
          type={view}
          onClick={handleMuscleClick}
          highlightedColors={["hsl(var(--primary))"]}
          style={{ width: "180px", height: "auto" }}
        />
      </div>

      {/* Selected muscles display */}
      {selectedTargets.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {selectedTargets.map((target) => (
            <button
              key={target}
              type="button"
              onClick={() => onTargetDeselect(target)}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              {TARGET_LABELS[target]}
              <span className="text-primary-foreground/70">×</span>
            </button>
          ))}
          {onClear && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onClear}
              className="text-muted-foreground"
            >
              초기화
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export { TARGET_LABELS, MUSCLE_TO_TARGET, TARGET_TO_MUSCLES };
