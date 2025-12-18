import { useQuery } from "@tanstack/react-query";

import { workoutRepository } from "@/data/repositories/workoutRepository";

import { workoutKeys } from "./keys";

/**
 * Fetches a workout day (session + exercises + sets) for the given date.
 * @param date - ISO date string (YYYY-MM-DD)
 */
export function useWorkoutByDate(date: string) {
  return useQuery({
    queryKey: workoutKeys.byDate(date),
    queryFn: () => workoutRepository.getByDate(date),
  });
}

/**
 * Fetches all workout sessions within a date range (inclusive).
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 */
export function useWorkoutSessionsByDateRange(
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: workoutKeys.sessionRange(startDate, endDate),
    queryFn: () =>
      workoutRepository.listSessionsByDateRange(startDate, endDate),
  });
}

/**
 * Fetches the most recent sets for an exercise by name (before given date).
 * Used to show "previous" column in workout tracking.
 * Prefers catalogExerciseId matching when available, with name-based fallback.
 */
export function usePreviousExerciseSets(
  args: {
    catalogExerciseId?: string;
    exerciseName: string;
    beforeDate: string;
  }
) {
  return useQuery({
    queryKey: workoutKeys.previousSets(args),
    queryFn: () => workoutRepository.getPreviousSetsForExercise(args),
    enabled: !!args.exerciseName,
  });
}
