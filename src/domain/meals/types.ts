/**
 * Meal type categories for food entries.
 */
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

/**
 * Represents a single food entry in the meal tracker.
 * Based on docs/user-flow.md MVP spec.
 */
export interface FoodEntry {
  /** Unique identifier (crypto.randomUUID) */
  id: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Meal category */
  mealType: MealType;
  /** Food name */
  name: string;
  /** Calories in kcal */
  calories: number;
  /** Protein in grams (optional) */
  protein?: number;
  /** Carbohydrates in grams (optional) */
  carbs?: number;
  /** Fat in grams (optional) */
  fat?: number;
  /** Quantity/serving size (optional) */
  quantity?: number;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * Input type for creating/updating food entries.
 * Excludes auto-generated fields.
 */
export type FoodEntryInput = Omit<FoodEntry, "id" | "createdAt" | "updatedAt">;
