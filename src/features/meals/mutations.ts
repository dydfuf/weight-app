import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mealRepository } from "@/data/repositories/mealRepository";
import type { FoodEntryInput } from "@/domain/meals/types";

import { mealKeys } from "./keys";

/**
 * Creates a new food entry.
 * Invalidates the query for the entry's date on success.
 */
export function useAddFoodEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FoodEntryInput) => mealRepository.create(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: mealKeys.byDate(variables.date),
      });
    },
  });
}

/**
 * Updates an existing food entry.
 * Invalidates queries for both old and new dates if date changed.
 */
export function useUpdateFoodEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<FoodEntryInput>;
      previousDate?: string;
    }) => mealRepository.update(id, input),
    onSuccess: (updatedEntry, variables) => {
      // Invalidate the updated entry's date
      queryClient.invalidateQueries({
        queryKey: mealKeys.byDate(updatedEntry.date),
      });

      // If date changed, also invalidate the previous date
      if (
        variables.previousDate &&
        variables.previousDate !== updatedEntry.date
      ) {
        queryClient.invalidateQueries({
          queryKey: mealKeys.byDate(variables.previousDate),
        });
      }

      // Invalidate the detail query
      queryClient.invalidateQueries({
        queryKey: mealKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Deletes a food entry.
 * Requires the date to invalidate the correct query.
 */
export function useDeleteFoodEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; date: string }) =>
      mealRepository.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: mealKeys.byDate(variables.date),
      });
      queryClient.invalidateQueries({
        queryKey: mealKeys.detail(variables.id),
      });
    },
  });
}