import { Dumbbell, Flame, Target } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface WorkoutSummaryCardProps {
  totalSets: number;
  completedSets: number;
  totalVolume: number;
}

export function WorkoutSummaryCard({
  totalSets,
  completedSets,
  totalVolume,
}: WorkoutSummaryCardProps) {
  const completionPercent =
    totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-4">
        {/* Progress Bar */}
        {totalSets > 0 && (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">운동 진행률</span>
              <span className="font-bold text-primary">
                {completionPercent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Target className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">{totalSets}</span>
            <span className="text-xs text-muted-foreground">총 세트</span>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">{completedSets}</span>
            <span className="text-xs text-muted-foreground">완료</span>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Flame className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">
              {totalVolume > 1000
                ? `${(totalVolume / 1000).toFixed(1)}k`
                : totalVolume}
            </span>
            <span className="text-xs text-muted-foreground">볼륨(kg)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
