/**
 * Macro targets for a day (grams).
 */
export interface MacroTargets {
  carbs?: number;
  protein?: number;
  fat?: number;
}

/**
 * App-specific user goals (stored locally for MVP).
 * This is modeled as a single record with `id = "default"`.
 */
export interface Goals {
  /** Primary key (always "default") */
  id: string;
  /** Daily calorie target (kcal) */
  dailyCalories?: number;
  /** Daily macro targets (grams) */
  macroTargets?: MacroTargets;
  /** Target body weight (kg) */
  weightGoal?: number;
  /** Workout goal (e.g. sessions per week) */
  workoutGoal?: number;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * Input type for setting goals.
 * Excludes the fixed `id` and auto-managed timestamp.
 */
export type GoalsInput = Omit<Goals, "id" | "updatedAt">;
