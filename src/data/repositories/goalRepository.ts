import { getDB } from "@/data/db";
import type { Goals, GoalsInput } from "@/domain/goals/types";

const GOALS_ID = "default";

// ----------------------------------------------------------------------------
// Interface
// ----------------------------------------------------------------------------

/**
 * Repository interface for app-specific goals/settings.
 * Implementations can be swapped (IndexedDB → HTTP) without changing consumers.
 */
export interface GoalRepository {
  get(): Promise<Goals | undefined>;
  set(input: Partial<GoalsInput>): Promise<Goals>;
  clear(): Promise<void>;
}

// ----------------------------------------------------------------------------
// IndexedDB Implementation
// ----------------------------------------------------------------------------

export const goalRepository: GoalRepository = {
  async get(): Promise<Goals | undefined> {
    const db = await getDB();
    return db.get("goals", GOALS_ID);
  },

  async set(input: Partial<GoalsInput>): Promise<Goals> {
    const db = await getDB();
    const now = Date.now();
    const existing = await db.get("goals", GOALS_ID);

    const updated: Goals = {
      id: GOALS_ID,
      ...(existing ?? {}),
      ...input,
      updatedAt: now,
    };

    await db.put("goals", updated);
    return updated;
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.delete("goals", GOALS_ID);
  },
};
