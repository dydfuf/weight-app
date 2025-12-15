/**
 * Query key factory for goals/settings queries.
 */
export const goalKeys = {
  /** Root key for all goals queries */
  all: ["goals"] as const,

  /** Key for the singleton goals record */
  get: () => ["goals", "get"] as const,
};
