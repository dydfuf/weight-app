import { Star, Dumbbell } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Exercise } from "@/domain/exercises/types";
import { useIsFavorite } from "@/features/exercises/queries";
import { useToggleFavorite } from "@/features/exercises/mutations";

/**
 * Korean labels for body parts
 */
const BODY_PART_LABELS: Record<string, string> = {
  back: "등",
  cardio: "유산소",
  chest: "가슴",
  "lower arms": "전완",
  "lower legs": "하체",
  neck: "목",
  shoulders: "어깨",
  "upper arms": "팔",
  "upper legs": "허벅지",
  waist: "복부",
};

/**
 * Korean labels for equipment
 */
const EQUIPMENT_LABELS: Record<string, string> = {
  assisted: "어시스트",
  band: "밴드",
  barbell: "바벨",
  "body weight": "맨몸",
  "bosu ball": "보수볼",
  cable: "케이블",
  dumbbell: "덤벨",
  "elliptical machine": "일립티컬",
  "ez barbell": "EZ바",
  hammer: "해머",
  kettlebell: "케틀벨",
  "leverage machine": "머신",
  "medicine ball": "메디신볼",
  "olympic barbell": "올림픽바",
  "resistance band": "저항밴드",
  roller: "롤러",
  rope: "로프",
  "skierg machine": "스키에르그",
  "sled machine": "슬레드",
  "smith machine": "스미스머신",
  "stability ball": "짐볼",
  "stationary bike": "실내자전거",
  "stepmill machine": "스텝밀",
  tire: "타이어",
  "trap bar": "트랩바",
  "upper body ergometer": "암에르고미터",
  weighted: "웨이티드",
  "wheel roller": "휠롤러",
};

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
  showFavoriteButton?: boolean;
  className?: string;
}

export function ExerciseCard({
  exercise,
  onSelect,
  showFavoriteButton = true,
  className,
}: ExerciseCardProps) {
  const { data: isFavorited = false } = useIsFavorite(exercise.id);
  const toggleFavorite = useToggleFavorite();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite.mutate({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      isFavorited,
    });
  };

  const bodyPartLabel = BODY_PART_LABELS[exercise.bodyPart] || exercise.bodyPart;
  const equipmentLabel = EQUIPMENT_LABELS[exercise.equipment] || exercise.equipment;

  return (
    <button
      type="button"
      onClick={() => onSelect(exercise)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50 active:bg-muted",
        className
      )}
    >
      {/* Exercise image/gif or placeholder */}
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {exercise.gifUrl ? (
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <Dumbbell className="size-6 text-muted-foreground" />
        )}
      </div>

      {/* Exercise info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {exercise.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {bodyPartLabel} · {equipmentLabel}
        </p>
      </div>

      {/* Favorite button */}
      {showFavoriteButton && (
        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={toggleFavorite.isPending}
          className={cn(
            "shrink-0 p-2 transition-colors",
            isFavorited
              ? "text-yellow-500"
              : "text-muted-foreground hover:text-yellow-500"
          )}
        >
          <Star
            className={cn("size-5", isFavorited && "fill-current")}
          />
        </button>
      )}
    </button>
  );
}

export { BODY_PART_LABELS, EQUIPMENT_LABELS };
