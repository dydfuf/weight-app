import { useMutation, useQueryClient } from "@tanstack/react-query";

import { workoutRepository } from "@/data/repositories/workoutRepository";
import type {
  WorkoutExerciseInput,
  WorkoutSetInput,
  WorkoutSetUpdateInput,
} from "@/domain/workouts/types";

import { workoutKeys } from "./keys";

/**
 * Adds an exercise to a workout day.
 */
export function useAddWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WorkoutExerciseInput) =>
      workoutRepository.addExercise(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.byDate(variables.date),
      });
    },
  });
}

/**
 * Deletes an exercise (and cascades its sets).
 */
export function useDeleteWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, exerciseId }: { date: string; exerciseId: string }) =>
      workoutRepository.deleteExercise({ date, exerciseId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.byDate(variables.date),
      });
    },
  });
}

/**
 * Adds a set to an exercise.
 */
export function useAddWorkoutSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WorkoutSetInput) => workoutRepository.addSet(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.byDate(variables.date),
      });
    },
  });
}

/**
 * Updates a set.
 */
export function useUpdateWorkoutSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      date,
      setId,
      input,
    }: {
      date: string;
      setId: string;
      input: WorkoutSetUpdateInput;
    }) => workoutRepository.updateSet({ date, setId, input }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.byDate(variables.date),
      });
    },
  });
}

/**
 * Deletes a set.
 */
export function useDeleteWorkoutSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, setId }: { date: string; setId: string }) =>
      workoutRepository.deleteSet({ date, setId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.byDate(variables.date),
      });
    },
  });
}
