import { getDB } from "@/data/db";
import type {
  Exercise,
  ExerciseFilters,
  FavoriteExercise,
  FavoriteExerciseInput,
  ExerciseUsageRecord,
  ExerciseUsageInput,
  BodyPart,
  MuscleTarget,
} from "@/domain/exercises/types";
import { getSearchNeedles } from "@/domain/exercises/search";

export interface ExerciseRepository {
  // Exercise queries
  getAll(): Promise<Exercise[]>;
  getById(id: string): Promise<Exercise | undefined>;
  getByBodyPart(bodyPart: BodyPart): Promise<Exercise[]>;
  getByTarget(target: MuscleTarget): Promise<Exercise[]>;
  search(query: string): Promise<Exercise[]>;
  getByFilters(filters: ExerciseFilters): Promise<Exercise[]>;

  // Exercise cache management
  bulkUpsert(exercises: Exercise[]): Promise<void>;
  count(): Promise<number>;

  // Favorites
  getFavorites(): Promise<FavoriteExercise[]>;
  addFavorite(input: FavoriteExerciseInput): Promise<FavoriteExercise>;
  removeFavorite(exerciseId: string): Promise<void>;
  isFavorite(exerciseId: string): Promise<boolean>;

  // Usage history (recent exercises)
  getRecentExercises(limit?: number): Promise<ExerciseUsageRecord[]>;
  recordUsage(input: ExerciseUsageInput): Promise<ExerciseUsageRecord>;
  clearUsageHistory(): Promise<void>;
}

export const exerciseRepository: ExerciseRepository = {
  // Exercise queries
  async getAll(): Promise<Exercise[]> {
    const db = await getDB();
    return db.getAll("exercises");
  },

  async getById(id: string): Promise<Exercise | undefined> {
    const db = await getDB();
    return db.get("exercises", id);
  },

  async getByBodyPart(bodyPart: BodyPart): Promise<Exercise[]> {
    const db = await getDB();
    return db.getAllFromIndex("exercises", "by-bodyPart", bodyPart);
  },

  async getByTarget(target: MuscleTarget): Promise<Exercise[]> {
    const db = await getDB();
    return db.getAllFromIndex("exercises", "by-target", target);
  },

  async search(query: string): Promise<Exercise[]> {
    const db = await getDB();
    const allExercises = await db.getAll("exercises");
    const needles = getSearchNeedles(query);
    if (needles.length === 0) return [];

    return allExercises.filter(
      (exercise) =>
        needles.some((needle) => {
          const hay = `${exercise.name} ${exercise.target} ${exercise.bodyPart} ${exercise.equipment}`.toLowerCase();
          return hay.includes(needle);
        })
    );
  },

  async getByFilters(filters: ExerciseFilters): Promise<Exercise[]> {
    const db = await getDB();
    let exercises: Exercise[];

    // Start with the most selective filter
    if (filters.target) {
      exercises = await db.getAllFromIndex(
        "exercises",
        "by-target",
        filters.target
      );
    } else if (filters.bodyPart) {
      exercises = await db.getAllFromIndex(
        "exercises",
        "by-bodyPart",
        filters.bodyPart
      );
    } else {
      exercises = await db.getAll("exercises");
    }

    // Apply remaining filters
    return exercises.filter((exercise) => {
      if (filters.bodyPart && exercise.bodyPart !== filters.bodyPart) {
        return false;
      }
      if (filters.target && exercise.target !== filters.target) {
        return false;
      }
      if (filters.equipment && exercise.equipment !== filters.equipment) {
        return false;
      }
      if (filters.search) {
        const needles = getSearchNeedles(filters.search);
        if (needles.length > 0) {
          const hay = `${exercise.name} ${exercise.target} ${exercise.bodyPart} ${exercise.equipment}`.toLowerCase();
          if (!needles.some((needle) => hay.includes(needle))) return false;
        }
      }
      return true;
    });
  },

  // Exercise cache management
  async bulkUpsert(exercises: Exercise[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction("exercises", "readwrite");

    await Promise.all([
      ...exercises.map((exercise) => tx.store.put(exercise)),
      tx.done,
    ]);
  },

  async count(): Promise<number> {
    const db = await getDB();
    return db.count("exercises");
  },

  // Favorites
  async getFavorites(): Promise<FavoriteExercise[]> {
    const db = await getDB();
    const favorites = await db.getAllFromIndex(
      "favoriteExercises",
      "by-createdAt"
    );
    // Return in reverse order (most recent first)
    return favorites.reverse();
  },

  async addFavorite(input: FavoriteExerciseInput): Promise<FavoriteExercise> {
    const db = await getDB();
    const favorite: FavoriteExercise = {
      ...input,
      createdAt: Date.now(),
    };
    await db.put("favoriteExercises", favorite);
    return favorite;
  },

  async removeFavorite(exerciseId: string): Promise<void> {
    const db = await getDB();
    await db.delete("favoriteExercises", exerciseId);
  },

  async isFavorite(exerciseId: string): Promise<boolean> {
    const db = await getDB();
    const favorite = await db.get("favoriteExercises", exerciseId);
    return !!favorite;
  },

  // Usage history (recent exercises)
  async getRecentExercises(limit = 10): Promise<ExerciseUsageRecord[]> {
    const db = await getDB();
    const allRecords = await db.getAllFromIndex(
      "exerciseUsageHistory",
      "by-usedAt"
    );

    // Get unique exercises (most recent usage only)
    const seen = new Set<string>();
    const unique: ExerciseUsageRecord[] = [];

    // Iterate in reverse (most recent first)
    for (let i = allRecords.length - 1; i >= 0 && unique.length < limit; i--) {
      const record = allRecords[i];
      if (!seen.has(record.exerciseId)) {
        seen.add(record.exerciseId);
        unique.push(record);
      }
    }

    return unique;
  },

  async recordUsage(input: ExerciseUsageInput): Promise<ExerciseUsageRecord> {
    const db = await getDB();
    const record: ExerciseUsageRecord = {
      id: crypto.randomUUID(),
      ...input,
      usedAt: Date.now(),
    };
    await db.add("exerciseUsageHistory", record);
    return record;
  },

  async clearUsageHistory(): Promise<void> {
    const db = await getDB();
    await db.clear("exerciseUsageHistory");
  },
};
