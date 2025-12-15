import { useMemo } from "react";
import { Link } from "react-router";
import { Dumbbell, TrendingUp, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useGoals } from "@/features/goals/queries";
import { useFoodEntriesByDate } from "@/features/meals/queries";
import { useLatestMetricByType } from "@/features/metrics/queries";
import { useWorkoutByDate } from "@/features/workouts/queries";

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function formatSignedKcalDiff(diff: number) {
  if (diff === 0) return { label: "잔여", value: 0 };
  if (diff > 0) return { label: "잔여", value: diff };
  return { label: "초과", value: Math.abs(diff) };
}

export function DashboardPage() {
  const today = getTodayDateString();

  const { data: goals, isLoading: isGoalsLoading } = useGoals();
  const { data: foodEntries = [], isLoading: isMealsLoading } =
    useFoodEntriesByDate(today);
  const { data: workoutDay, isLoading: isWorkoutsLoading } =
    useWorkoutByDate(today);
  const { data: latestWeight, isLoading: isWeightLoading } =
    useLatestMetricByType("weight");

  const mealTotals = useMemo(() => {
    return foodEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + (entry.protein ?? 0),
        carbs: acc.carbs + (entry.carbs ?? 0),
        fat: acc.fat + (entry.fat ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [foodEntries]);

  const workoutTotals = useMemo(() => {
    const exercises = workoutDay?.exercises ?? [];
    const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const totalVolume = exercises.reduce(
      (acc, ex) =>
        acc + ex.sets.reduce((setAcc, s) => setAcc + s.weight * s.reps, 0),
      0
    );
    return { totalSets, totalVolume };
  }, [workoutDay?.exercises]);

  const dailyCaloriesGoal = goals?.dailyCalories;
  const hasMacroTotals =
    mealTotals.protein > 0 || mealTotals.carbs > 0 || mealTotals.fat > 0;

  return (
    <div className="mx-auto w-full max-w-md space-y-4 p-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">대시보드</h1>
        <p className="text-xs text-muted-foreground">{today}</p>
      </header>

      <section className="grid grid-cols-3 gap-2">
        <Button asChild variant="outline" className="h-auto flex-col py-3">
          <Link to="/app/meals?add=1">
            <Utensils />
            음식 추가
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col py-3">
          <Link to="/app/workouts?add=1">
            <Dumbbell />
            운동 기록
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col py-3">
          <Link to="/app/progress?add=1&type=weight">
            <TrendingUp />
            체중 입력
          </Link>
        </Button>
      </section>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            오늘 식단
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isMealsLoading || isGoalsLoading ? (
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          ) : foodEntries.length === 0 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                기록된 음식이 없습니다.
              </p>
              <Button asChild size="sm">
                <Link to="/app/meals?add=1">추가하기</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {mealTotals.calories}
                  </span>
                  <span className="text-sm text-muted-foreground">kcal</span>
                </div>

                {dailyCaloriesGoal !== undefined ? (
                  (() => {
                    const diff = dailyCaloriesGoal - mealTotals.calories;
                    const { label, value } = formatSignedKcalDiff(diff);
                    return (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          목표 {dailyCaloriesGoal} kcal
                        </p>
                        <p className="text-sm font-medium">
                          {label} {value} kcal
                        </p>
                      </div>
                    );
                  })()
                ) : (
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/app/settings">목표 설정</Link>
                  </Button>
                )}
              </div>

              {hasMacroTotals && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>탄 {mealTotals.carbs}g</span>
                  <span>단 {mealTotals.protein}g</span>
                  <span>지 {mealTotals.fat}g</span>
                </div>
              )}

              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/app/meals">식단 보기</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            오늘 운동
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isWorkoutsLoading ? (
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          ) : workoutTotals.totalSets === 0 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                기록된 운동이 없습니다.
              </p>
              <Button asChild size="sm">
                <Link to="/app/workouts?add=1">추가하기</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {workoutTotals.totalSets}
                </span>
                <span className="text-sm text-muted-foreground">세트</span>
              </div>
              {workoutTotals.totalVolume > 0 && (
                <p className="text-xs text-muted-foreground">
                  총 볼륨 {workoutTotals.totalVolume}
                </p>
              )}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/app/workouts">운동 보기</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            체중 최신값
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isWeightLoading ? (
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          ) : !latestWeight ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                기록된 체중이 없습니다.
              </p>
              <Button asChild size="sm">
                <Link to="/app/progress?add=1&type=weight">입력하기</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {latestWeight.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {latestWeight.unit}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestWeight.date}
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/app/progress">변화 보기</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
