import { getDB } from "@/data/db";
import type {
  MetricEntry,
  MetricEntryInput,
  MetricType,
} from "@/domain/metrics/types";

// ----------------------------------------------------------------------------
// Interface
// ----------------------------------------------------------------------------

/**
 * Repository interface for metric/progress operations.
 * Implementations can be swapped (IndexedDB → HTTP) without changing consumers.
 */
export interface MetricRepository {
  listByType(type: MetricType): Promise<MetricEntry[]>;
  getLatestByType(type: MetricType): Promise<MetricEntry | undefined>;
  create(input: MetricEntryInput): Promise<MetricEntry>;
  update(id: string, input: Partial<MetricEntryInput>): Promise<MetricEntry>;
  delete(id: string): Promise<void>;
}

// ----------------------------------------------------------------------------
// IndexedDB Implementation
// ----------------------------------------------------------------------------

function compareDateThenCreatedAtAsc(a: MetricEntry, b: MetricEntry) {
  return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
}

export const metricRepository: MetricRepository = {
  async listByType(type: MetricType): Promise<MetricEntry[]> {
    const db = await getDB();
    const entries = await db.getAllFromIndex("metricEntries", "by-type", type);
    entries.sort(compareDateThenCreatedAtAsc);
    return entries;
  },

  async getLatestByType(type: MetricType): Promise<MetricEntry | undefined> {
    const db = await getDB();
    const entries = await db.getAllFromIndex("metricEntries", "by-type", type);

    let latest: MetricEntry | undefined;
    for (const entry of entries) {
      if (!latest) {
        latest = entry;
        continue;
      }

      if (entry.date > latest.date) {
        latest = entry;
        continue;
      }

      if (entry.date === latest.date && entry.createdAt > latest.createdAt) {
        latest = entry;
      }
    }

    return latest;
  },

  async create(input: MetricEntryInput): Promise<MetricEntry> {
    const db = await getDB();
    const now = Date.now();

    const entry: MetricEntry = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await db.add("metricEntries", entry);
    return entry;
  },

  async update(
    id: string,
    input: Partial<MetricEntryInput>
  ): Promise<MetricEntry> {
    const db = await getDB();
    const existing = await db.get("metricEntries", id);

    if (!existing) {
      throw new Error(`MetricEntry with id "${id}" not found`);
    }

    const updated: MetricEntry = {
      ...existing,
      ...input,
      updatedAt: Date.now(),
    };

    await db.put("metricEntries", updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("metricEntries", id);
  },
};
