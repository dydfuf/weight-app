import { useMemo } from "react";
import { useSearchParams } from "react-router";

import { DateNavigator } from "@/components/date-navigation";
import { useWorkoutByDate } from "@/features/workouts/queries";

import { WorkoutsHeader } from "./WorkoutsHeader";
import { WorkoutSummaryCard } from "./WorkoutSummaryCard";
import { ExerciseCard } from "./ExerciseCard";
import { AddExerciseDrawer } from "./AddExerciseDrawer";

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function WorkoutsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDate = searchParams.get("date") || getTodayDateString();

  const { data, isLoading } = useWorkoutByDate(selectedDate);

  const handleDateChange = (date: string) => {
    setSearchParams({ date });
  };

  const exercises = useMemo(() => data?.exercises ?? [], [data?.exercises]);

  const totals = useMemo(() => {
    const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const completedSets = exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    );
    const totalVolume = exercises.reduce(
      (acc, ex) =>
        acc + ex.sets.reduce((setAcc, s) => setAcc + s.weight * s.reps, 0),
      0
    );
    return { totalSets, completedSets, totalVolume };
  }, [exercises]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-md p-4">
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-14 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          {[1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4 p-4">
      <WorkoutsHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
      <WorkoutSummaryCard
        totalSets={totals.totalSets}
        completedSets={totals.completedSets}
        totalVolume={totals.totalVolume}
      />
      <div className="space-y-4">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            date={selectedDate}
          />
        ))}
      </div>
      <AddExerciseDrawer date={selectedDate} isEmpty={exercises.length === 0} />
    </div>
  );
}
