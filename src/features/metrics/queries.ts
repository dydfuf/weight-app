import { useQuery } from "@tanstack/react-query";

import { metricRepository } from "@/data/repositories/metricRepository";
import type { MetricType } from "@/domain/metrics/types";

import { metricKeys } from "./keys";

/**
 * Fetches all metric entries for a given type.
 */
export function useMetricEntriesByType(type: MetricType) {
  return useQuery({
    queryKey: metricKeys.byType(type),
    queryFn: () => metricRepository.listByType(type),
  });
}

/**
 * Fetches the latest metric entry for a given type.
 */
export function useLatestMetricByType(type: MetricType) {
  return useQuery({
    queryKey: metricKeys.latest(type),
    queryFn: () => metricRepository.getLatestByType(type),
  });
}
