import type { ExerciseFilters } from "@/domain/exercises/types";

export const exerciseKeys = {
  all: ["exercises"] as const,
  lists: () => [...exerciseKeys.all, "list"] as const,
  list: (filters: ExerciseFilters) =>
    [...exerciseKeys.lists(), filters] as const,
  details: () => [...exerciseKeys.all, "detail"] as const,
  detail: (id: string) => [...exerciseKeys.details(), id] as const,
  favorites: () => [...exerciseKeys.all, "favorites"] as const,
  recentlyUsed: () => [...exerciseKeys.all, "recentlyUsed"] as const,
  isFavorite: (id: string) => [...exerciseKeys.all, "isFavorite", id] as const,
};
