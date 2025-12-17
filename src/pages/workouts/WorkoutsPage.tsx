import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { DateNavigator } from "@/components/date-navigation";
import { FAB } from "@/components/fab";
import { useWorkoutByDate } from "@/features/workouts/queries";

import { AddExerciseDrawer } from "./AddExerciseDrawer";
import { ExerciseCard } from "./ExerciseCard";
import { WorkoutsHeader } from "./WorkoutsHeader";
import { WorkoutSummaryCard } from "./WorkoutSummaryCard";

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function WorkoutsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDate = searchParams.get("date") || getTodayDateString();

  const { data, isLoading } = useWorkoutByDate(selectedDate);

  const [isDrawerOpen, setIsDrawerOpen] = useState(
    () => searchParams.get("add") === "1"
  );

  const handleDateChange = (date: string) => {
    setSearchParams({ date });
  };

  const exercises = useMemo(() => data?.exercises ?? [], [data?.exercises]);
  const isEmpty = exercises.length === 0;

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
    <div className="mx-auto w-full max-w-md space-y-4 p-4 pb-24">
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

      {/* Empty state with inline trigger */}
      {isEmpty && (
        <AddExerciseDrawer
          date={selectedDate}
          showEmptyTrigger
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />
      )}

      {/* Drawer without trigger (controlled by FAB) */}
      {!isEmpty && (
        <AddExerciseDrawer
          date={selectedDate}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />
      )}

      {/* FAB Button */}
      <FAB onClick={() => setIsDrawerOpen(true)} label="운동 추가" />
    </div>
  );
}
