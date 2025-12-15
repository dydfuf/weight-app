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
