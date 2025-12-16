/**
 * Query key factory for workout-related queries.
 */
export const workoutKeys = {
  /** Root key for all workout queries */
  all: ["workouts"] as const,

  /** Key for a workout day by date */
  byDate: (date: string) => ["workouts", "byDate", date] as const,

  /** Key for workout sessions within a date range */
  sessionRange: (startDate: string, endDate: string) =>
    ["workouts", "sessionRange", startDate, endDate] as const,
};
