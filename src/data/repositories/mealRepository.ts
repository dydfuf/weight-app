import { getDB } from "@/data/db";
import type { FoodEntry, FoodEntryInput } from "@/domain/meals/types";

// ----------------------------------------------------------------------------
// Interface
// ----------------------------------------------------------------------------

/**
 * Repository interface for meal/food entry operations.
 * Implementations can be swapped (IndexedDB → HTTP) without changing consumers.
 */
export interface MealRepository {
  /** Get all food entries for a specific date */
  getByDate(date: string): Promise<FoodEntry[]>;
  /** Get a single food entry by ID */
  getById(id: string): Promise<FoodEntry | undefined>;
  /** Create a new food entry */
  create(input: FoodEntryInput): Promise<FoodEntry>;
  /** Update an existing food entry */
  update(id: string, input: Partial<FoodEntryInput>): Promise<FoodEntry>;
  /** Delete a food entry by ID */
  delete(id: string): Promise<void>;
}

// ----------------------------------------------------------------------------
// IndexedDB Implementation
// ----------------------------------------------------------------------------

/**
 * IndexedDB-based implementation of MealRepository.
 * Used for local-first prototyping; will be replaced with HTTP implementation later.
 */
export const mealRepository: MealRepository = {
  async getByDate(date: string): Promise<FoodEntry[]> {
    const db = await getDB();
    return db.getAllFromIndex("foodEntries", "by-date", date);
  },

  async getById(id: string): Promise<FoodEntry | undefined> {
    const db = await getDB();
    return db.get("foodEntries", id);
  },

  async create(input: FoodEntryInput): Promise<FoodEntry> {
    const db = await getDB();
    const now = Date.now();
    const entry: FoodEntry = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await db.add("foodEntries", entry);
    return entry;
  },

  async update(id: string, input: Partial<FoodEntryInput>): Promise<FoodEntry> {
    const db = await getDB();
    const existing = await db.get("foodEntries", id);

    if (!existing) {
      throw new Error(`FoodEntry with id "${id}" not found`);
    }

    const updated: FoodEntry = {
      ...existing,
      ...input,
      updatedAt: Date.now(),
    };
    await db.put("foodEntries", updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("foodEntries", id);
  },
};
