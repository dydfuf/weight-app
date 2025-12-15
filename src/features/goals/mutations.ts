import { useMutation, useQueryClient } from "@tanstack/react-query";

import { goalRepository } from "@/data/repositories/goalRepository";
import type { GoalsInput } from "@/domain/goals/types";

import { goalKeys } from "./keys";

/**
 * Sets (merges) the goals record.
 */
export function useSetGoals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Partial<GoalsInput>) => goalRepository.set(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: goalKeys.get(),
      });
    },
  });
}

/**
 * Clears the goals record.
 */
export function useClearGoals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => goalRepository.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: goalKeys.get(),
      });
    },
  });
}
