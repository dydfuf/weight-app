import { useState, useMemo, useEffect } from "react";
import { Clock, Star, List, User } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  MuscleSelector,
  ExerciseSearchInput,
  ExerciseList,
} from "@/components/exercise-selector";
import {
  useExercises,
  useFavoriteExercises,
  useRecentExercises,
} from "@/features/exercises/queries";
import type {
  Exercise,
  MuscleTarget,
  ExerciseUsageRecord,
  FavoriteExercise,
} from "@/domain/exercises/types";
import { cn } from "@/lib/utils";
import { exerciseRepository } from "@/data/repositories/exerciseRepository";
import { fetchExerciseById, isApiEnabled } from "@/data/api/exerciseApi";
import { isSearchQueryReady } from "@/domain/exercises/search";

type TabType = "recent" | "favorites" | "all" | "body";

interface SelectExerciseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercise: Exercise) => void;
}

export function SelectExerciseDrawer({
  open,
  onOpenChange,
  onSelect,
}: SelectExerciseDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedTargets, setSelectedTargets] = useState<MuscleTarget[]>([]);
  const [resolvedRecent, setResolvedRecent] = useState<Exercise[]>([]);
  const [missingRecent, setMissingRecent] = useState<ExerciseUsageRecord[]>([]);
  const [isResolvingRecent, setIsResolvingRecent] = useState(false);
  const [resolvedFavorites, setResolvedFavorites] = useState<Exercise[]>([]);
  const [missingFavorites, setMissingFavorites] = useState<FavoriteExercise[]>(
    []
  );
  const [isResolvingFavorites, setIsResolvingFavorites] = useState(false);

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setSelectedTargets([]);
      setResolvedRecent([]);
      setMissingRecent([]);
      setIsResolvingRecent(false);
      setResolvedFavorites([]);
      setMissingFavorites([]);
      setIsResolvingFavorites(false);
    }
  }, [open]);

  // Debounce search to avoid spamming API on every keystroke
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  // Queries
  const { data: recentExercises = [], isLoading: isLoadingRecent } =
    useRecentExercises(20);
  const { data: favoriteExercises = [], isLoading: isLoadingFavorites } =
    useFavoriteExercises();
  const { data: allExercises = [], isLoading: isLoadingAll } = useExercises({
    search: debouncedSearchQuery || undefined,
    target: selectedTargets.length === 1 ? selectedTargets[0] : undefined,
  });

  async function resolveRecordsToExercises(
    ids: string[]
  ): Promise<Map<string, Exercise>> {
    const cachedResults = await Promise.all(
      ids.map(async (id) => ({ id, exercise: await exerciseRepository.getById(id) }))
    );

    const byId = new Map<string, Exercise>();
    for (const row of cachedResults) {
      if (row.exercise) byId.set(row.id, row.exercise);
    }

    const missingIds = ids.filter((id) => !byId.has(id));
    if (missingIds.length === 0) return byId;

    if (!isApiEnabled || !navigator.onLine) return byId;

    // Avoid too many individual requests at once (best-effort)
    const toFetch = missingIds.slice(0, 20);
    const fetched = await Promise.all(
      toFetch.map(async (id) => {
        try {
          return await fetchExerciseById(id);
        } catch (e) {
          console.warn("Failed to fetch exercise by id:", id, e);
          return null;
        }
      })
    );

    const found = fetched.filter((e): e is Exercise => !!e);
    if (found.length > 0) {
      await exerciseRepository.bulkUpsert(found);
      for (const ex of found) byId.set(ex.id, ex);
    }

    return byId;
  }

  // Resolve recent records -> Exercise objects (cache first, then single-id API fetch)
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function run() {
      setIsResolvingRecent(true);
      try {
        const ids = recentExercises.map((r) => r.exerciseId);
        const byId = await resolveRecordsToExercises(ids);

        const resolved: Exercise[] = [];
        const missing: ExerciseUsageRecord[] = [];
        for (const record of recentExercises) {
          const ex = byId.get(record.exerciseId);
          if (ex) resolved.push(ex);
          else missing.push(record);
        }

        if (!cancelled) {
          setResolvedRecent(resolved);
          setMissingRecent(missing);
        }
      } finally {
        if (!cancelled) setIsResolvingRecent(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [open, recentExercises]);

  // Resolve favorite records -> Exercise objects (cache first, then single-id API fetch)
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function run() {
      setIsResolvingFavorites(true);
      try {
        const ids = favoriteExercises.map((f) => f.exerciseId);
        const byId = await resolveRecordsToExercises(ids);

        const resolved: Exercise[] = [];
        const missing: FavoriteExercise[] = [];
        for (const fav of favoriteExercises) {
          const ex = byId.get(fav.exerciseId);
          if (ex) resolved.push(ex);
          else missing.push(fav);
        }

        if (!cancelled) {
          setResolvedFavorites(resolved);
          setMissingFavorites(missing);
        }
      } finally {
        if (!cancelled) setIsResolvingFavorites(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [open, favoriteExercises]);

  // Filter exercises based on search and selected targets
  const filteredExercises = useMemo(() => {
    let exercises = allExercises;

    // Filter by multiple targets if more than one selected
    if (selectedTargets.length > 1) {
      exercises = exercises.filter((e) =>
        selectedTargets.includes(e.target as MuscleTarget)
      );
    }

    return exercises;
  }, [allExercises, selectedTargets]);

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    onOpenChange(false);
  };

  const handleTargetSelect = (target: MuscleTarget) => {
    setSelectedTargets((prev) =>
      prev.includes(target) ? prev : [...prev, target]
    );
  };

  const handleTargetDeselect = (target: MuscleTarget) => {
    setSelectedTargets((prev) => prev.filter((t) => t !== target));
  };

  const handleClearTargets = () => {
    setSelectedTargets([]);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "recent", label: "최근", icon: <Clock className="size-4" /> },
    { id: "favorites", label: "즐겨찾기", icon: <Star className="size-4" /> },
    { id: "all", label: "전체", icon: <List className="size-4" /> },
    { id: "body", label: "인체도", icon: <User className="size-4" /> },
  ];

  const getExercisesForTab = () => {
    const hasAnyFilter =
      isSearchQueryReady(debouncedSearchQuery) ||
      selectedTargets.length > 0;

    switch (activeTab) {
      case "recent":
        return {
          items: [
            ...resolvedRecent.map((exercise) => ({ kind: "exercise" as const, exercise })),
            ...missingRecent.map((r) => ({
              kind: "placeholder" as const,
              id: r.exerciseId,
              name: r.exerciseName,
            })),
          ],
          isLoading: isLoadingRecent || isResolvingRecent,
          emptyMessage:
            recentExercises.length === 0
              ? "최근 사용한 운동이 없습니다"
              : "최근 운동을 불러오는 중...",
        };
      case "favorites":
        return {
          items: [
            ...resolvedFavorites.map((exercise) => ({
              kind: "exercise" as const,
              exercise,
            })),
            ...missingFavorites.map((f) => ({
              kind: "placeholder" as const,
              id: f.exerciseId,
              name: f.exerciseName,
            })),
          ],
          isLoading: isLoadingFavorites || isResolvingFavorites,
          emptyMessage:
            favoriteExercises.length === 0
              ? "즐겨찾기한 운동이 없습니다"
              : "즐겨찾기 운동을 불러오는 중...",
        };
      case "all":
      case "body": {
        if (!hasAnyFilter) {
          return {
            items: [],
            isLoading: false,
            emptyMessage: "검색하거나 인체도에서 부위를 선택하세요",
          };
        }
        return {
          items: filteredExercises.map((exercise) => ({
            kind: "exercise" as const,
            exercise,
          })),
          isLoading: isLoadingAll,
          emptyMessage:
            selectedTargets.length > 0
              ? "선택한 부위에 해당하는 운동이 없습니다"
              : debouncedSearchQuery
                ? "검색 결과가 없습니다"
                : "검색하거나 인체도에서 부위를 선택하세요",
        };
      }
      default:
        return { items: [], isLoading: false, emptyMessage: "" };
    }
  };

  const { items, isLoading, emptyMessage } = getExercisesForTab();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-h-[90vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle>운동 선택</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-1 flex-col overflow-hidden px-4">
          {/* Search input */}
          <ExerciseSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            className="mb-3"
          />

          {/* Tabs */}
          <div className="mb-3 flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                type="button"
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "shrink-0 gap-1.5",
                  activeTab === tab.id && "pointer-events-none"
                )}
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Body map (only shown on body tab) */}
          {activeTab === "body" && (
            <div className="mb-3 rounded-xl border border-border bg-muted/30 p-3">
              <MuscleSelector
                selectedTargets={selectedTargets}
                onTargetSelect={handleTargetSelect}
                onTargetDeselect={handleTargetDeselect}
                onClear={handleClearTargets}
              />
            </div>
          )}

          {/* Exercise list */}
          <div className="flex-1 overflow-y-auto pb-safe">
            <ExerciseList
              items={items}
              isLoading={isLoading}
              onSelect={handleSelect}
              emptyMessage={emptyMessage}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
