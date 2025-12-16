import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MacroTargets } from "@/domain/goals/types";

interface DailySummaryCardProps {
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  calorieGoal?: number;
  macroTargets?: MacroTargets;
}

interface MacroItemProps {
  label: string;
  current: number;
  goal?: number;
  color: string;
}

function MacroItem({ label, current, goal, color }: MacroItemProps) {
  const percentage =
    goal && goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{Math.round(current)}g</p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width]"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

export function DailySummaryCard({
  totals,
  calorieGoal,
  macroTargets,
}: DailySummaryCardProps) {
  const remaining = calorieGoal ? calorieGoal - totals.calories : undefined;
  const caloriePercentage =
    calorieGoal && calorieGoal > 0
      ? Math.min(100, (totals.calories / calorieGoal) * 100)
      : 0;

  const hasGoals = calorieGoal !== undefined;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {/* Calories Section */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {remaining !== undefined && remaining >= 0
                ? "잔여 칼로리"
                : remaining !== undefined
                ? "초과 칼로리"
                : "오늘 섭취"}
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {remaining !== undefined
                ? Math.abs(remaining).toLocaleString()
                : totals.calories.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                kcal
              </span>
            </p>
          </div>
          {calorieGoal && (
            <div className="text-right">
              <p className="text-sm font-bold text-primary">
                {totals.calories.toLocaleString()} /{" "}
                {calorieGoal.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">목표</p>
            </div>
          )}
        </div>

        {/* Calorie Progress Bar */}
        {calorieGoal && (
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${caloriePercentage}%` }}
            />
          </div>
        )}

        {/* Macro Grid */}
        <div className="grid grid-cols-3 gap-2">
          <MacroItem
            label="단백질"
            current={totals.protein}
            goal={macroTargets?.protein}
            color="hsl(var(--primary))"
          />
          <MacroItem
            label="탄수화물"
            current={totals.carbs}
            goal={macroTargets?.carbs}
            color="hsl(217 91% 60%)"
          />
          <MacroItem
            label="지방"
            current={totals.fat}
            goal={macroTargets?.fat}
            color="hsl(45 93% 47%)"
          />
        </div>

        {/* CTA if no goals */}
        {!hasGoals && (
          <div className="text-center pt-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/app/settings">칼로리 목표 설정</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
