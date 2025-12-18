import { useQuery } from "@tanstack/react-query";

import { exerciseRepository } from "@/data/repositories/exerciseRepository";
import {
  isApiEnabled,
  fetchExercisesByBodyPart,
  fetchExercisesByTarget,
  fetchExercisesByEquipment,
  searchExercisesByName,
} from "@/data/api/exerciseApi";
import type {
  ExerciseFilters,
  BodyPart,
  MuscleTarget,
  Equipment,
  Exercise,
} from "@/domain/exercises/types";
import {
  interpretSearchQuery,
  isSearchQueryReady,
  getSearchNeedles,
} from "@/domain/exercises/search";
import { exerciseKeys } from "./keys";

/**
 * Hook to fetch exercises with optional filters
 * Remote-first when filters exist (online + API key), otherwise cache-first.
 * Always falls back to local IndexedDB cache if API fails/unavailable.
 */
export function useExercises(filters: ExerciseFilters = {}) {
  return useQuery({
    queryKey: exerciseKeys.list(filters),
    queryFn: async () => {
      const hasSearch = isSearchQueryReady(filters.search ?? "");
      const hasAnyFilter =
        !!filters.target || !!filters.bodyPart || !!filters.equipment || hasSearch;

      // Always compute cache (fast + offline fallback)
      const cached = await exerciseRepository.getByFilters(filters);

      // If no filters, do NOT remote-fetch the whole dataset.
      if (!hasAnyFilter) return cached;

      // If offline or no API key, use cache
      if (!isApiEnabled || !navigator.onLine) return cached;

      // Remote-first for filtered queries, then apply any remaining filters locally.
      try {
        let apiBase: Exercise[] | undefined;

        if (filters.target) {
          apiBase = await fetchExercisesByTarget(filters.target);
        } else if (filters.bodyPart) {
          apiBase = await fetchExercisesByBodyPart(filters.bodyPart);
        } else if (filters.equipment) {
          apiBase = await fetchExercisesByEquipment(filters.equipment);
        } else if (hasSearch && filters.search) {
          const interpreted = interpretSearchQuery(filters.search);
          if (interpreted.bodyPart) {
            apiBase = await fetchExercisesByBodyPart(interpreted.bodyPart);
          } else if (interpreted.target) {
            apiBase = await fetchExercisesByTarget(interpreted.target);
          } else if (interpreted.equipment) {
            apiBase = await fetchExercisesByEquipment(interpreted.equipment);
          } else if (interpreted.englishNameQuery) {
            apiBase = await searchExercisesByName(interpreted.englishNameQuery.trim());
          }
        }

        if (apiBase && apiBase.length > 0) {
          // Cache API results for future offline use / favorites / recents resolution
          await exerciseRepository.bulkUpsert(apiBase);

          // Apply remaining filters (to support combinations like target+equipment, etc.)
          const refined = apiBase.filter((exercise) => {
            if (filters.bodyPart && exercise.bodyPart !== filters.bodyPart) return false;
            if (filters.target && exercise.target !== filters.target) return false;
            if (
              (filters.equipment as Equipment | undefined) &&
              exercise.equipment !== (filters.equipment as Equipment)
            ) {
              return false;
            }
            if (filters.search) {
              if (isSearchQueryReady(filters.search)) {
                const needles = getSearchNeedles(filters.search);
                if (needles.length > 0) {
                  const hay = `${exercise.name} ${exercise.target} ${exercise.bodyPart} ${exercise.equipment}`.toLowerCase();
                  if (!needles.some((needle) => hay.includes(needle))) return false;
                }
              }
            }
            return true;
          });

          return refined.length > 0 ? refined : cached;
        }

        return cached;
      } catch (error) {
        console.error("Failed to fetch from API, using cache:", error);
        return cached;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to fetch exercises by body part
 */
export function useExercisesByBodyPart(bodyPart: BodyPart | null) {
  return useQuery({
    queryKey: exerciseKeys.list({ bodyPart: bodyPart ?? undefined }),
    queryFn: async () => {
      if (!bodyPart) return [];
      return exerciseRepository.getByBodyPart(bodyPart);
    },
    enabled: !!bodyPart,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook to fetch exercises by target muscle
 */
export function useExercisesByTarget(target: MuscleTarget | null) {
  return useQuery({
    queryKey: exerciseKeys.list({ target: target ?? undefined }),
    queryFn: async () => {
      if (!target) return [];
      return exerciseRepository.getByTarget(target);
    },
    enabled: !!target,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook to search exercises by name
 */
export function useSearchExercises(query: string) {
  return useQuery({
    queryKey: exerciseKeys.list({ search: query }),
    queryFn: async () => {
      if (!query || !isSearchQueryReady(query)) return [];
      return exerciseRepository.search(query);
    },
    enabled: isSearchQueryReady(query),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook to get a single exercise by ID
 */
export function useExercise(id: string | null) {
  return useQuery({
    queryKey: exerciseKeys.detail(id ?? ""),
    queryFn: async () => {
      if (!id) return null;
      return exerciseRepository.getById(id);
    },
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook to get user's favorite exercises
 */
export function useFavoriteExercises() {
  return useQuery({
    queryKey: exerciseKeys.favorites(),
    queryFn: () => exerciseRepository.getFavorites(),
  });
}

/**
 * Hook to check if an exercise is favorited
 */
export function useIsFavorite(exerciseId: string) {
  return useQuery({
    queryKey: exerciseKeys.isFavorite(exerciseId),
    queryFn: () => exerciseRepository.isFavorite(exerciseId),
    enabled: !!exerciseId,
  });
}

/**
 * Hook to get recently used exercises
 */
export function useRecentExercises(limit = 10) {
  return useQuery({
    queryKey: exerciseKeys.recentlyUsed(),
    queryFn: () => exerciseRepository.getRecentExercises(limit),
  });
}

/**
 * Hook to get exercise count (for checking if DB is seeded)
 */
export function useExerciseCount() {
  return useQuery({
    queryKey: [...exerciseKeys.all, "count"],
    queryFn: () => exerciseRepository.count(),
  });
}
