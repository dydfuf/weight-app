import { useQuery } from "@tanstack/react-query";

import { goalRepository } from "@/data/repositories/goalRepository";

import { goalKeys } from "./keys";

/**
 * Fetches the singleton goals record.
 */
export function useGoals() {
  return useQuery({
    queryKey: goalKeys.get(),
    queryFn: () => goalRepository.get(),
  });
}
