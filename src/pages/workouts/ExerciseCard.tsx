import { useState, useMemo } from "react";
import { MoreHorizontalIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAddWorkoutSet,
  useDeleteWorkoutExercise,
  useUpdateWorkoutSet,
} from "@/features/workouts/mutations";
import { usePreviousExerciseSets } from "@/features/workouts/queries";
import type { WorkoutExerciseWithSets } from "@/data/repositories/workoutRepository";

import { SetRow, NewSetRow } from "./SetRow";

interface ExerciseCardProps {
  exercise: WorkoutExerciseWithSets;
  date: string;
}

export function ExerciseCard({ exercise, date }: ExerciseCardProps) {
  const [showNewSetRow, setShowNewSetRow] = useState(false);

  const deleteExercise = useDeleteWorkoutExercise();
  const addSet = useAddWorkoutSet();
  const updateSet = useUpdateWorkoutSet();

  // Fetch previous sets for this exercise
  const { data: previousSetsData = [] } = usePreviousExerciseSets(
    exercise.name,
    date
  );

  // Convert to simple { weight, reps } array
  const previousSets = useMemo(() => {
    return previousSetsData.map((s) => ({ weight: s.weight, reps: s.reps }));
  }, [previousSetsData]);

  const handleDeleteExercise = () => {
    deleteExercise.mutate({ date, exerciseId: exercise.id });
  };

  const handleCompleteSet = (setId: string, weight: number, reps: number) => {
    updateSet.mutate({
      date,
      setId,
      input: { weight, reps, completed: true },
    });
  };

  const handleAddSet = (weight: number, reps: number) => {
    addSet.mutate(
      {
        date,
        exerciseId: exercise.id,
        weight,
        reps,
      },
      {
        onSuccess: () => {
          setShowNewSetRow(false);
        },
      }
    );
  };

  // Find the first incomplete set to mark as active
  const activeSetIndex = exercise.sets.findIndex((s) => !s.completed);

  // Get previous set for each current set position
  const getPreviousSet = (index: number) => {
    return previousSets[index] ?? previousSets[previousSets.length - 1];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          {exercise.name}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontalIcon className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">메뉴</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDeleteExercise}
              className="text-destructive focus:text-destructive"
            >
              <Trash2Icon className="mr-2 h-4 w-4" />
              운동 삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Header Row */}
        <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2.5rem] gap-2 px-2 py-1 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>Set</span>
          <span>Prev</span>
          <span>kg</span>
          <span>Reps</span>
          <span className="flex justify-center">
            <span className="sr-only">완료</span>✓
          </span>
        </div>

        {/* Set Rows */}
        {exercise.sets.map((set, index) => (
          <SetRow
            key={set.id}
            set={set}
            previousSet={getPreviousSet(index)}
            onComplete={handleCompleteSet}
            isActive={index === activeSetIndex}
          />
        ))}

        {/* New Set Row */}
        {showNewSetRow && (
          <NewSetRow
            setIndex={exercise.sets.length + 1}
            previousSet={getPreviousSet(exercise.sets.length)}
            onAdd={handleAddSet}
            isPending={addSet.isPending}
          />
        )}

        {/* Add Set Button */}
        {!showNewSetRow && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-center text-primary"
            onClick={() => setShowNewSetRow(true)}
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            세트 추가
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
