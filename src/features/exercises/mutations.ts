import { useMutation, useQueryClient } from "@tanstack/react-query";

import { exerciseRepository } from "@/data/repositories/exerciseRepository";
import type {
  FavoriteExerciseInput,
  ExerciseUsageInput,
  Exercise,
} from "@/domain/exercises/types";
import { exerciseKeys } from "./keys";

/**
 * Hook to add an exercise to favorites
 */
export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FavoriteExerciseInput) =>
      exerciseRepository.addFavorite(input),
    onSuccess: (_, variables) => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: exerciseKeys.favorites() });
      // Invalidate specific exercise favorite status
      queryClient.invalidateQueries({
        queryKey: exerciseKeys.isFavorite(variables.exerciseId),
      });
    },
  });
}

/**
 * Hook to remove an exercise from favorites
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: string) =>
      exerciseRepository.removeFavorite(exerciseId),
    onSuccess: (_, exerciseId) => {
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: exerciseKeys.favorites() });
      // Invalidate specific exercise favorite status
      queryClient.invalidateQueries({
        queryKey: exerciseKeys.isFavorite(exerciseId),
      });
    },
  });
}

/**
 * Hook to toggle favorite status
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  return useMutation({
    mutationFn: async ({
      exerciseId,
      exerciseName,
      isFavorited,
    }: {
      exerciseId: string;
      exerciseName: string;
      isFavorited: boolean;
    }) => {
      if (isFavorited) {
        await exerciseRepository.removeFavorite(exerciseId);
      } else {
        await exerciseRepository.addFavorite({ exerciseId, exerciseName });
      }
    },
    onSuccess: (_, variables) => {
      addFavorite.reset();
      removeFavorite.reset();
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: exerciseKeys.favorites() });
      queryClient.invalidateQueries({
        queryKey: exerciseKeys.isFavorite(variables.exerciseId),
      });
    },
  });
}

/**
 * Hook to record exercise usage (for recent exercises)
 */
export function useRecordExerciseUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ExerciseUsageInput) =>
      exerciseRepository.recordUsage(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.recentlyUsed() });
    },
  });
}

/**
 * Hook to clear exercise usage history
 */
export function useClearUsageHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => exerciseRepository.clearUsageHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.recentlyUsed() });
    },
  });
}

/**
 * Hook to bulk upsert exercises (for seeding)
 */
export function useBulkUpsertExercises() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exercises: Exercise[]) =>
      exerciseRepository.bulkUpsert(exercises),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
    },
  });
}
