import { exerciseRepository } from "@/data/repositories/exerciseRepository";
import type { Exercise } from "@/domain/exercises/types";
import exercisesJson from "./exercises.json";

/**
 * Seed the exercises database with initial data if empty.
 * This ensures the app works offline with a basic set of exercises.
 */
export async function seedExercisesIfEmpty(): Promise<void> {
  const count = await exerciseRepository.count();

  if (count === 0) {
    console.log("[seed] Seeding exercises database...");
    await exerciseRepository.bulkUpsert(exercisesJson as Exercise[]);
    console.log(`[seed] Seeded ${exercisesJson.length} exercises`);
  }
}

/**
 * Force re-seed exercises (replaces existing data)
 */
export async function reseedExercises(): Promise<void> {
  console.log("[seed] Re-seeding exercises database...");
  await exerciseRepository.bulkUpsert(exercisesJson as Exercise[]);
  console.log(`[seed] Seeded ${exercisesJson.length} exercises`);
}
