import { useMutation, useQueryClient } from "@tanstack/react-query";

import { metricRepository } from "@/data/repositories/metricRepository";
import type { MetricEntryInput, MetricType } from "@/domain/metrics/types";

import { metricKeys } from "./keys";

/**
 * Creates a new metric entry.
 */
export function useCreateMetricEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MetricEntryInput) => metricRepository.create(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: metricKeys.byType(variables.type),
      });
      queryClient.invalidateQueries({
        queryKey: metricKeys.latest(variables.type),
      });
    },
  });
}

/**
 * Updates an existing metric entry.
 */
export function useUpdateMetricEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<MetricEntryInput>;
    }) => metricRepository.update(id, input),
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({
        queryKey: metricKeys.byType(updatedEntry.type),
      });
      queryClient.invalidateQueries({
        queryKey: metricKeys.latest(updatedEntry.type),
      });
    },
  });
}

/**
 * Deletes a metric entry.
 */
export function useDeleteMetricEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; type: MetricType }) =>
      metricRepository.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: metricKeys.byType(variables.type),
      });
      queryClient.invalidateQueries({
        queryKey: metricKeys.latest(variables.type),
      });
    },
  });
}
