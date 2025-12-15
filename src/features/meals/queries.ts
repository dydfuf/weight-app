import { useQuery } from "@tanstack/react-query";

import { mealRepository } from "@/data/repositories/mealRepository";

import { mealKeys } from "./keys";

/**
 * Fetches all food entries for a specific date.
 * @param date - ISO date string (YYYY-MM-DD)
 */
export function useFoodEntriesByDate(date: string) {
  return useQuery({
    queryKey: mealKeys.byDate(date),
    queryFn: () => mealRepository.getByDate(date),
  });
}

/**
 * Fetches a single food entry by ID.
 * @param id - Food entry ID
 */
export function useFoodEntryById(id: string | undefined) {
  return useQuery({
    queryKey: mealKeys.detail(id ?? ""),
    queryFn: () => mealRepository.getById(id!),
    enabled: !!id,
  });
}
