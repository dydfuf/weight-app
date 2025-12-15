import { openDB, type IDBPDatabase, type DBSchema } from "idb";

import type { FoodEntry } from "@/domain/meals/types";

const DB_NAME = "weight-app";
const DB_VERSION = 1;

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
      },
    });
  }
  return dbPromise;
}
