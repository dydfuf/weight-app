/**
 * A workout session represents one day's workout log container.
 * For MVP, we keep exactly one session per date.
 */
export interface WorkoutSession {
  /** Unique identifier (crypto.randomUUID) */
  id: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * An exercise entry within a workout session (e.g. Bench Press).
 * Stored separately from sets to keep data normalized.
 */
export interface WorkoutExercise {
  /** Unique identifier (crypto.randomUUID) */
  id: string;
  /** Parent session id */
  sessionId: string;
  /** Denormalized date for easier querying */
  date: string;
  /** Exercise name */
  name: string;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * A single set entry for an exercise (weight x reps).
 */
export interface WorkoutSet {
  /** Unique identifier (crypto.randomUUID) */
  id: string;
  /** Parent session id */
  sessionId: string;
  /** Parent exercise id */
  exerciseId: string;
  /** Denormalized date for easier querying */
  date: string;
  /** Display order within an exercise */
  setIndex: number;
  /** Weight in kilograms */
  weight: number;
  /** Repetitions */
  reps: number;
  /** Whether this set has been completed */
  completed?: boolean;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * Input type for creating a new exercise entry.
 */
export interface WorkoutExerciseInput {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Exercise name */
  name: string;
}

/**
 * Input type for creating a new set entry.
 * `sessionId` and `setIndex` are derived by the repository.
 */
export interface WorkoutSetInput {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Parent exercise id */
  exerciseId: string;
  /** Weight in kilograms */
  weight: number;
  /** Repetitions */
  reps: number;
}

/**
 * Input type for updating an existing set.
 */
export type WorkoutSetUpdateInput = Partial<
  Pick<WorkoutSet, "weight" | "reps" | "completed">
>;
