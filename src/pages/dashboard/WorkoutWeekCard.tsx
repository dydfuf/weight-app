import { useMemo } from "react";
import { Link } from "react-router";
import { Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoals } from "@/features/goals/queries";
import { useWorkoutSessionsByDateRange } from "@/features/workouts/queries";

function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday

  // Calculate Monday of this week
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));

  // Calculate Sunday of this week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: monday.toISOString().split("T")[0],
    endDate: sunday.toISOString().split("T")[0],
  };
}

export function WorkoutWeekCard() {
  const { startDate, endDate } = useMemo(() => getWeekRange(), []);

  const { data: sessions = [], isLoading: sessionsLoading } =
    useWorkoutSessionsByDateRange(startDate, endDate);
  const { data: goals, isLoading: goalsLoading } = useGoals();

  const sessionCount = sessions.length;
  const workoutGoal = goals?.workoutGoal;
  const percentage =
    workoutGoal && workoutGoal > 0
      ? Math.min(100, (sessionCount / workoutGoal) * 100)
      : 0;

  // Generate week dots
  const weekDays = useMemo(() => {
    const days: { date: string; label: string; hasWorkout: boolean }[] = [];
    const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];
    const monday = new Date(startDate);

    const sessionDates = new Set(sessions.map((s) => s.date));

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        label: dayLabels[i],
        hasWorkout: sessionDates.has(dateStr),
      });
    }

    return days;
  }, [startDate, sessions]);

  if (sessionsLoading || goalsLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            이번주 운동
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-16 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          이번주 운동
        </CardTitle>
        <Link
          to="/app/workouts"
          className="text-xs font-medium text-primary hover:underline"
        >
          기록 보기
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold">{sessionCount}</span>
              {workoutGoal && (
                <span className="text-xs text-muted-foreground">
                  / {workoutGoal} 회
                </span>
              )}
            </div>
            {workoutGoal ? (
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">목표 없음</p>
            )}
          </div>
        </div>

        {/* Week dots */}
        <div className="flex justify-between">
          {weekDays.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <div
                className={`size-6 rounded-full border-2 ${
                  day.hasWorkout
                    ? "border-primary bg-primary"
                    : "border-muted bg-transparent"
                }`}
              />
              <span className="text-[10px] text-muted-foreground">
                {day.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA if no goal */}
        {!workoutGoal && (
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link to="/app/settings">주간 운동 목표 설정</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
