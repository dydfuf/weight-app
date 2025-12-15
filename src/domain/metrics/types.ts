/**
 * Metric types supported by the MVP.
 * Extend this union as the app grows.
 */
export type MetricType = "weight" | "bodyFat";

/**
 * A single metric record (e.g. body weight, body fat).
 * Multiple entries per day are allowed; `createdAt` acts as the record timestamp.
 */
export interface MetricEntry {
  /** Unique identifier (crypto.randomUUID) */
  id: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Metric category */
  type: MetricType;
  /** Numeric value */
  value: number;
  /** Unit label (e.g. kg, %) */
  unit: string;
  /** Creation timestamp (used to distinguish multiple same-day records) */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * Input type for creating/updating metric entries.
 * Excludes auto-generated fields.
 */
export type MetricEntryInput = Omit<
  MetricEntry,
  "id" | "createdAt" | "updatedAt"
>;
