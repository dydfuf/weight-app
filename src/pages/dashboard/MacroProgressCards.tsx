import { useMemo } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { useGoals } from "@/features/goals/queries";
import { useFoodEntriesByDate } from "@/features/meals/queries";

interface MacroCardProps {
  label: string;
  current: number;
  goal: number | undefined;
  color: string;
  unit?: string;
}

function MacroCard({
  label,
  current,
  goal,
  color,
  unit = "g",
}: MacroCardProps) {
  const percentage =
    goal && goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-[width]"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="flex items-end justify-between">
        <p className="text-sm font-bold">
          {current}
          {unit}
        </p>
        <p className="text-[10px] text-muted-foreground">
          / {goal ?? "—"}
          {goal ? unit : ""}
        </p>
      </div>
    </div>
  );
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function MacroProgressCards() {
  const today = getTodayDateString();
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: foodEntries = [], isLoading: mealsLoading } =
    useFoodEntriesByDate(today);

  const totals = useMemo(() => {
    return foodEntries.reduce(
      (acc, entry) => ({
        protein: acc.protein + (entry.protein ?? 0),
        carbs: acc.carbs + (entry.carbs ?? 0),
        fat: acc.fat + (entry.fat ?? 0),
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );
  }, [foodEntries]);

  const macroTargets = goals?.macroTargets;
  const hasGoals =
    macroTargets?.protein !== undefined ||
    macroTargets?.carbs !== undefined ||
    macroTargets?.fat !== undefined;

  if (goalsLoading || mealsLoading) {
    return (
      <section className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border bg-muted"
          />
        ))}
      </section>
    );
  }

  // Show CTA if no macro goals set
  if (!hasGoals) {
    return (
      <section className="rounded-xl border bg-card p-4 text-center">
        <p className="mb-2 text-sm text-muted-foreground">
          매크로 목표를 설정하면 진행 상황을 확인할 수 있어요
        </p>
        <Button asChild size="sm" variant="outline">
          <Link to="/app/settings">목표 설정하기</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-3 gap-3">
      <MacroCard
        label="단백질"
        current={Math.round(totals.protein)}
        goal={macroTargets?.protein}
        color="hsl(var(--primary))"
      />
      <MacroCard
        label="탄수화물"
        current={Math.round(totals.carbs)}
        goal={macroTargets?.carbs}
        color="hsl(217 91% 60%)" /* blue-500 */
      />
      <MacroCard
        label="지방"
        current={Math.round(totals.fat)}
        goal={macroTargets?.fat}
        color="hsl(45 93% 47%)" /* yellow-500 */
      />
    </section>
  );
}
