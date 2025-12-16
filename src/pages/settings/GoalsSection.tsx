import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useFoodEntriesByDate } from "@/features/meals/queries";
import { useClearGoals, useSetGoals } from "@/features/goals/mutations";
import { useGoals } from "@/features/goals/queries";
import {
  useLatestMetricByType,
  useMetricEntriesByType,
} from "@/features/metrics/queries";

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export function GoalsSection() {
  const today = getTodayDateString();
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const setGoals = useSetGoals();
  const clearGoals = useClearGoals();

  const { data: todayFoodEntries = [] } = useFoodEntriesByDate(today);
  const todayCalories = React.useMemo(
    () => todayFoodEntries.reduce((acc, e) => acc + e.calories, 0),
    [todayFoodEntries]
  );

  const { data: latestWeight } = useLatestMetricByType("weight");
  const { data: weightEntries = [] } = useMetricEntriesByType("weight");
  const { data: latestBodyFat } = useLatestMetricByType("bodyFat");

  const currentWeight = latestWeight?.value;
  const startWeight = React.useMemo(() => {
    if (weightEntries.length === 0) return undefined;
    return Math.max(...weightEntries.map((e) => e.value));
  }, [weightEntries]);

  const goalWeight = goals?.weightGoal;
  const remainingKg =
    currentWeight !== undefined && goalWeight !== undefined
      ? Math.max(0, Number((currentWeight - goalWeight).toFixed(1)))
      : undefined;

  const progress = React.useMemo(() => {
    if (
      startWeight === undefined ||
      currentWeight === undefined ||
      goalWeight === undefined
    )
      return undefined;
    const denom = startWeight - goalWeight;
    if (denom <= 0) return 0;
    return clamp01((startWeight - currentWeight) / denom);
  }, [startWeight, currentWeight, goalWeight]);

  const progressPct =
    progress === undefined ? undefined : Math.round(progress * 100);

  const [isEditing, setIsEditing] = React.useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const dailyCaloriesRaw = String(formData.get("dailyCalories") ?? "").trim();
    const weightGoalRaw = String(formData.get("weightGoal") ?? "").trim();

    const dailyCalories =
      dailyCaloriesRaw === "" ? undefined : Number(dailyCaloriesRaw);
    const weightGoal = weightGoalRaw === "" ? undefined : Number(weightGoalRaw);

    if (dailyCalories !== undefined && !Number.isFinite(dailyCalories)) return;
    if (weightGoal !== undefined && !Number.isFinite(weightGoal)) return;

    setGoals.mutate(
      { dailyCalories, weightGoal },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold">Goals &amp; Milestones</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing((v) => !v)}
        >
          {isEditing ? "Done" : "Edit Goals"}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Target Weight
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">
                  {goalWeight !== undefined ? goalWeight : "—"}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  kg
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Target</p>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground">
                Goal Progress
              </p>
              <p className="mt-1 inline-flex rounded-md bg-muted px-2 py-1 text-xs font-semibold">
                {remainingKg !== undefined ? `${remainingKg} kg left` : "—"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">
                Current:{" "}
                {currentWeight !== undefined ? `${currentWeight} kg` : "—"}
              </span>
              <span className="font-bold text-primary">
                {progressPct !== undefined ? `${progressPct}%` : "—"}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${progressPct ?? 0}%` }}
              />
            </div>
            {startWeight !== undefined && (
              <p className="text-[11px] text-muted-foreground">
                Start (auto): {startWeight} kg
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Body Fat %
          </p>
          <div className="mt-1 flex items-end gap-1.5">
            <span className="text-xl font-bold">
              {latestBodyFat?.value !== undefined
                ? `${latestBodyFat.value}%`
                : "—"}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              / 12%
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[40%] rounded-full bg-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Daily Calories
          </p>
          <div className="mt-1 flex items-end gap-1.5">
            <span className="text-xl font-bold">
              {todayCalories.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              / {goals?.dailyCalories?.toLocaleString() ?? "—"}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width:
                  goals?.dailyCalories && goals.dailyCalories > 0
                    ? `${Math.min(
                        100,
                        (todayCalories / goals.dailyCalories) * 100
                      )}%`
                    : "0%",
              }}
            />
          </div>
        </Card>
      </div>

      {isEditing && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">목표 편집</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form onSubmit={handleSave} className="space-y-3">
              <Field>
                <FieldLabel htmlFor="dailyCalories">
                  일일 칼로리 (kcal)
                </FieldLabel>
                <Input
                  key={goals?.updatedAt ?? "no-goals"}
                  id="dailyCalories"
                  name="dailyCalories"
                  type="number"
                  min={0}
                  placeholder="예: 2000"
                  defaultValue={
                    goals?.dailyCalories !== undefined
                      ? goals.dailyCalories
                      : ""
                  }
                  disabled={goalsLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="weightGoal">목표 체중 (kg)</FieldLabel>
                <Input
                  key={`${goals?.updatedAt ?? "no-goals"}-weightGoal`}
                  id="weightGoal"
                  name="weightGoal"
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="예: 75"
                  defaultValue={
                    goals?.weightGoal !== undefined ? goals.weightGoal : ""
                  }
                  disabled={goalsLoading}
                />
              </Field>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={setGoals.isPending || goalsLoading}
                >
                  {setGoals.isPending ? "저장 중..." : "저장"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => clearGoals.mutate()}
                  disabled={clearGoals.isPending || goalsLoading}
                >
                  초기화
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
