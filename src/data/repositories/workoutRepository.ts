import { getDB } from "@/data/db";
import type {
  WorkoutExercise,
  WorkoutExerciseInput,
  WorkoutSession,
  WorkoutSet,
  WorkoutSetInput,
  WorkoutSetUpdateInput,
} from "@/domain/workouts/types";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface WorkoutExerciseWithSets extends WorkoutExercise {
  sets: WorkoutSet[];
}

export interface WorkoutDay {
  date: string;
  session?: WorkoutSession;
  exercises: WorkoutExerciseWithSets[];
}

// ----------------------------------------------------------------------------
// Interface
// ----------------------------------------------------------------------------

/**
 * Repository interface for workout operations.
 * Implementation can later be swapped (IndexedDB → HTTP) without changing consumers.
 */
export interface WorkoutRepository {
  getByDate(date: string): Promise<WorkoutDay>;
  /** Get all workout sessions within a date range (inclusive) */
  listSessionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<WorkoutSession[]>;
  /** Get the most recent sets for an exercise (before given date). */
  getPreviousSetsForExercise(
    args: {
      catalogExerciseId?: string;
      exerciseName: string;
      beforeDate: string;
    }
  ): Promise<WorkoutSet[]>;
  ensureSession(date: string): Promise<WorkoutSession>;
  addExercise(input: WorkoutExerciseInput): Promise<WorkoutExercise>;
  deleteExercise(args: { date: string; exerciseId: string }): Promise<void>;
  addSet(input: WorkoutSetInput): Promise<WorkoutSet>;
  updateSet(args: {
    date: string;
    setId: string;
    input: WorkoutSetUpdateInput;
  }): Promise<WorkoutSet>;
  deleteSet(args: { date: string; setId: string }): Promise<void>;
}

// ----------------------------------------------------------------------------
// IndexedDB Implementation
// ----------------------------------------------------------------------------

function sortByCreatedAtAsc<T extends { createdAt: number }>(a: T, b: T) {
  return a.createdAt - b.createdAt;
}

function sortBySetIndexAsc(a: WorkoutSet, b: WorkoutSet) {
  return a.setIndex - b.setIndex || a.createdAt - b.createdAt;
}

export const workoutRepository: WorkoutRepository = {
  async getByDate(date: string): Promise<WorkoutDay> {
    const db = await getDB();
    const session = await db.getFromIndex("workoutSessions", "by-date", date);

    if (!session) {
      return { date, exercises: [] };
    }

    const [exercises, sets] = await Promise.all([
      db.getAllFromIndex("workoutExercises", "by-sessionId", session.id),
      db.getAllFromIndex("workoutSets", "by-sessionId", session.id),
    ]);

    exercises.sort(sortByCreatedAtAsc);
    sets.sort(sortBySetIndexAsc);

    const setsByExerciseId = new Map<string, WorkoutSet[]>();
    for (const set of sets) {
      const arr = setsByExerciseId.get(set.exerciseId) ?? [];
      arr.push(set);
      setsByExerciseId.set(set.exerciseId, arr);
    }

    const exercisesWithSets: WorkoutExerciseWithSets[] = exercises.map(
      (exercise) => ({
        ...exercise,
        sets: setsByExerciseId.get(exercise.id) ?? [],
      })
    );

    return {
      date,
      session,
      exercises: exercisesWithSets,
    };
  },

  async listSessionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<WorkoutSession[]> {
    const db = await getDB();
    const range = IDBKeyRange.bound(startDate, endDate);
    const sessions = await db.getAllFromIndex(
      "workoutSessions",
      "by-date",
      range
    );
    sessions.sort((a, b) => a.date.localeCompare(b.date));
    return sessions;
  },

  async getPreviousSetsForExercise(
    args: {
      catalogExerciseId?: string;
      exerciseName: string;
      beforeDate: string;
    }
  ): Promise<WorkoutSet[]> {
    const db = await getDB();

    const { catalogExerciseId, exerciseName, beforeDate } = args;

    // Get all exercises and find the most recent matching entry
    const allExercises = await db.getAll("workoutExercises");
    let matchingExercises = catalogExerciseId
      ? allExercises.filter(
          (ex) => ex.catalogExerciseId === catalogExerciseId && ex.date < beforeDate
        )
      : [];

    // Fallback for older/manual entries (no catalog id available)
    if (!catalogExerciseId || matchingExercises.length === 0) {
      matchingExercises = allExercises.filter(
        (ex) => ex.name === exerciseName && ex.date < beforeDate
      );
    }

    matchingExercises.sort((a, b) => b.date.localeCompare(a.date)); // Most recent first

    if (matchingExercises.length === 0) {
      return [];
    }

    // Get the most recent exercise
    const mostRecent = matchingExercises[0];

    // Get sets for that exercise
    const sets = await db.getAllFromIndex(
      "workoutSets",
      "by-exerciseId",
      mostRecent.id
    );
    sets.sort(sortBySetIndexAsc);

    return sets;
  },

  async ensureSession(date: string): Promise<WorkoutSession> {
    const db = await getDB();
    const tx = db.transaction("workoutSessions", "readwrite");
    const sessionsStore = tx.store;

    const existing = await sessionsStore.index("by-date").get(date);
    if (existing) {
      await tx.done;
      return existing;
    }

    const now = Date.now();
    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      date,
      createdAt: now,
      updatedAt: now,
    };

    await sessionsStore.add(session);
    await tx.done;
    return session;
  },

  async addExercise(input: WorkoutExerciseInput): Promise<WorkoutExercise> {
    const db = await getDB();
    const tx = db.transaction(
      ["workoutSessions", "workoutExercises"],
      "readwrite"
    );

    const sessionsStore = tx.objectStore("workoutSessions");
    const exercisesStore = tx.objectStore("workoutExercises");
    const now = Date.now();

    let session = await sessionsStore.index("by-date").get(input.date);
    if (!session) {
      session = {
        id: crypto.randomUUID(),
        date: input.date,
        createdAt: now,
        updatedAt: now,
      };
      await sessionsStore.add(session);
    } else {
      await sessionsStore.put({ ...session, updatedAt: now });
    }

    const exercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      date: input.date,
      name: input.name,
      catalogExerciseId: input.catalogExerciseId,
      createdAt: now,
      updatedAt: now,
    };

    await exercisesStore.add(exercise);
    await tx.done;
    return exercise;
  },

  async deleteExercise({
    date,
    exerciseId,
  }: {
    date: string;
    exerciseId: string;
  }): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(
      ["workoutSessions", "workoutExercises", "workoutSets"],
      "readwrite"
    );

    const sessionsStore = tx.objectStore("workoutSessions");
    const exercisesStore = tx.objectStore("workoutExercises");
    const setsStore = tx.objectStore("workoutSets");

    const exercise = await exercisesStore.get(exerciseId);
    if (!exercise) {
      await tx.done;
      return;
    }

    const sets = await setsStore.index("by-exerciseId").getAll(exerciseId);
    for (const set of sets) {
      await setsStore.delete(set.id);
    }

    await exercisesStore.delete(exerciseId);

    // Touch session updatedAt (best-effort)
    const session = await sessionsStore.index("by-date").get(date);
    if (session) {
      await sessionsStore.put({ ...session, updatedAt: Date.now() });
    }

    await tx.done;
  },

  async addSet(input: WorkoutSetInput): Promise<WorkoutSet> {
    const db = await getDB();
    const tx = db.transaction(
      ["workoutSessions", "workoutExercises", "workoutSets"],
      "readwrite"
    );

    const sessionsStore = tx.objectStore("workoutSessions");
    const exercisesStore = tx.objectStore("workoutExercises");
    const setsStore = tx.objectStore("workoutSets");

    const exercise = await exercisesStore.get(input.exerciseId);
    if (!exercise) {
      throw new Error(
        `WorkoutExercise with id "${input.exerciseId}" not found`
      );
    }

    const existingSets = await setsStore
      .index("by-exerciseId")
      .getAll(input.exerciseId);
    const nextSetIndex =
      existingSets.reduce((max, s) => Math.max(max, s.setIndex), 0) + 1;

    const now = Date.now();
    const set: WorkoutSet = {
      id: crypto.randomUUID(),
      sessionId: exercise.sessionId,
      exerciseId: exercise.id,
      date: exercise.date,
      setIndex: nextSetIndex,
      weight: input.weight,
      reps: input.reps,
      createdAt: now,
      updatedAt: now,
    };

    await setsStore.add(set);

    // Touch parent records
    await exercisesStore.put({ ...exercise, updatedAt: now });
    const session = await sessionsStore.get(exercise.sessionId);
    if (session) {
      await sessionsStore.put({ ...session, updatedAt: now });
    }

    await tx.done;
    return set;
  },

  async updateSet({
    setId,
    input,
  }: {
    date: string;
    setId: string;
    input: WorkoutSetUpdateInput;
  }): Promise<WorkoutSet> {
    const db = await getDB();
    const tx = db.transaction(
      ["workoutSessions", "workoutExercises", "workoutSets"],
      "readwrite"
    );

    const sessionsStore = tx.objectStore("workoutSessions");
    const exercisesStore = tx.objectStore("workoutExercises");
    const setsStore = tx.objectStore("workoutSets");

    const existing = await setsStore.get(setId);
    if (!existing) {
      throw new Error(`WorkoutSet with id "${setId}" not found`);
    }

    const now = Date.now();
    const updated: WorkoutSet = {
      ...existing,
      ...input,
      updatedAt: now,
    };

    await setsStore.put(updated);

    // Touch parent records
    const exercise = await exercisesStore.get(existing.exerciseId);
    if (exercise) {
      await exercisesStore.put({ ...exercise, updatedAt: now });
    }
    const session = await sessionsStore.get(existing.sessionId);
    if (session) {
      await sessionsStore.put({ ...session, updatedAt: now });
    }

    await tx.done;
    return updated;
  },

  async deleteSet({ setId }: { date: string; setId: string }): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(
      ["workoutSessions", "workoutExercises", "workoutSets"],
      "readwrite"
    );

    const sessionsStore = tx.objectStore("workoutSessions");
    const exercisesStore = tx.objectStore("workoutExercises");
    const setsStore = tx.objectStore("workoutSets");

    const existing = await setsStore.get(setId);
    if (!existing) {
      await tx.done;
      return;
    }

    const now = Date.now();
    await setsStore.delete(setId);

    // Touch parent records
    const exercise = await exercisesStore.get(existing.exerciseId);
    if (exercise) {
      await exercisesStore.put({ ...exercise, updatedAt: now });
    }
    const session = await sessionsStore.get(existing.sessionId);
    if (session) {
      await sessionsStore.put({ ...session, updatedAt: now });
    }

    await tx.done;
  },
};
