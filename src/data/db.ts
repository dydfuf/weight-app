import { openDB, type IDBPDatabase, type DBSchema } from "idb";

import type { FoodEntry } from "@/domain/meals/types";
import type {
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
} from "@/domain/workouts/types";
import type { MetricEntry, MetricType } from "@/domain/metrics/types";
import type { Goals } from "@/domain/goals/types";

const DB_NAME = "weight-app";
const DB_VERSION = 2;

/**
 * Database schema for type-safe IndexedDB operations.
 */
interface WeightAppDB extends DBSchema {
  foodEntries: {
    key: string;
    value: FoodEntry;
    indexes: {
      "by-date": string;
    };
  };

  workoutSessions: {
    key: string;
    value: WorkoutSession;
    indexes: {
      "by-date": string;
    };
  };

  workoutExercises: {
    key: string;
    value: WorkoutExercise;
    indexes: {
      "by-sessionId": string;
      "by-date": string;
    };
  };

  workoutSets: {
    key: string;
    value: WorkoutSet;
    indexes: {
      "by-sessionId": string;
      "by-exerciseId": string;
      "by-date": string;
    };
  };

  metricEntries: {
    key: string;
    value: MetricEntry;
    indexes: {
      "by-type": MetricType;
      "by-date": string;
      "by-type-date": [MetricType, string];
      "by-type-createdAt": [MetricType, number];
    };
  };

  goals: {
    key: string;
    value: Goals;
  };
}

let dbPromise: Promise<IDBPDatabase<WeightAppDB>> | null = null;

/**
 * Returns a singleton IndexedDB connection.
 * Creates the database and object stores on first call.
 */
export function getDB(): Promise<IDBPDatabase<WeightAppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<WeightAppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create foodEntries store if it doesn't exist
        if (!db.objectStoreNames.contains("foodEntries")) {
          const store = db.createObjectStore("foodEntries", { keyPath: "id" });
          store.createIndex("by-date", "date");
        }

        // Workouts: sessions (1 per date)
        if (!db.objectStoreNames.contains("workoutSessions")) {
          const store = db.createObjectStore("workoutSessions", {
            keyPath: "id",
          });
          store.createIndex("by-date", "date", { unique: true });
        }

        // Workouts: exercises (normalized)
        if (!db.objectStoreNames.contains("workoutExercises")) {
          const store = db.createObjectStore("workoutExercises", {
            keyPath: "id",
          });
          store.createIndex("by-sessionId", "sessionId");
          store.createIndex("by-date", "date");
        }

        // Workouts: sets (normalized)
        if (!db.objectStoreNames.contains("workoutSets")) {
          const store = db.createObjectStore("workoutSets", { keyPath: "id" });
          store.createIndex("by-sessionId", "sessionId");
          store.createIndex("by-exerciseId", "exerciseId");
          store.createIndex("by-date", "date");
        }

        // Metrics: multiple entries per day allowed
        if (!db.objectStoreNames.contains("metricEntries")) {
          const store = db.createObjectStore("metricEntries", {
            keyPath: "id",
          });
          store.createIndex("by-type", "type");
          store.createIndex("by-date", "date");
          store.createIndex("by-type-date", ["type", "date"]);
          store.createIndex("by-type-createdAt", ["type", "createdAt"]);
        }

        // Goals: single record (id = "default")
        if (!db.objectStoreNames.contains("goals")) {
          db.createObjectStore("goals", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}
