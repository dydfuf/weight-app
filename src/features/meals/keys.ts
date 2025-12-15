/**
 * Query key factory for meal-related queries.
 * Provides consistent, type-safe query keys for TanStack Query.
 */
export const mealKeys = {
  /** Root key for all meal queries */
  all: ["meals"] as const,

  /** Key for food entries by date */
  byDate: (date: string) => ["meals", "byDate", date] as const,

  /** Key for a single food entry detail */
  detail: (id: string) => ["meals", "detail", id] as const,
};
