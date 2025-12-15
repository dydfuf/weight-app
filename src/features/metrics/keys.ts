import type { MetricType } from "@/domain/metrics/types";

/**
 * Query key factory for metric/progress-related queries.
 */
export const metricKeys = {
  /** Root key for all metric queries */
  all: ["metrics"] as const,

  /** Key for metric entries by type */
  byType: (type: MetricType) => ["metrics", "byType", type] as const,

  /** Key for latest metric entry by type */
  latest: (type: MetricType) => ["metrics", "latest", type] as const,
};
