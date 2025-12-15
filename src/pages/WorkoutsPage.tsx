import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
  useAddWorkoutExercise,
  useAddWorkoutSet,
  useDeleteWorkoutExercise,
  useDeleteWorkoutSet,
} from "@/features/workouts/mutations";
import { useWorkoutByDate } from "@/features/workouts/queries";

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function WorkoutsPage() {
  const today = getTodayDateString();
  const { data, isLoading } = useWorkoutByDate(today);

  const addExercise = useAddWorkoutExercise();
  const deleteExercise = useDeleteWorkoutExercise();
  const addSet = useAddWorkoutSet();
  const deleteSet = useDeleteWorkoutSet();

  const exercises = useMemo(() => data?.exercises ?? [], [data?.exercises]);

  const totals = useMemo(() => {
    const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const totalVolume = exercises.reduce(
      (acc, ex) =>
        acc + ex.sets.reduce((setAcc, s) => setAcc + s.weight * s.reps, 0),
      0
    );
    return { totalSets, totalVolume };
  }, [exercises]);

  const [searchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(
    () => searchParams.get("add") === "1"
  );
  const [exerciseName, setExerciseName] = useState("");
  const [setForms, setSetForms] = useState<
    Record<string, { weight: string; reps: string }>
  >({});

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    addExercise.mutate(
      { date: today, name: exerciseName.trim() },
      {
        onSuccess: () => {
          setExerciseName("");
          setIsFormOpen(false);
        },
      }
    );
  };

  const handleAddSet = (exerciseId: string) => {
    const form = setForms[exerciseId] ?? { weight: "", reps: "" };
    const weight = Number(form.weight);
    const reps = Number(form.reps);

    if (!Number.isFinite(weight) || !Number.isFinite(reps)) return;
    if (weight <= 0 || reps <= 0) return;

    addSet.mutate(
      { date: today, exerciseId, weight, reps },
      {
        onSuccess: () => {
          setSetForms((prev) => ({
            ...prev,
            [exerciseId]: { weight: "", reps: "" },
          }));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <header className="space-y-2">
        <h1 className="text-lg font-semibold">운동</h1>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{totals.totalSets}</span>
          <span className="text-sm text-muted-foreground">세트</span>
        </div>
        {totals.totalVolume > 0 && (
          <p className="text-xs text-muted-foreground">
            총 볼륨 {totals.totalVolume}
          </p>
        )}
      </header>

      <div className="space-y-3">
        {exercises.map((exercise) => (
          <Card key={exercise.id}>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">{exercise.name}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() =>
                  deleteExercise.mutate({
                    date: today,
                    exerciseId: exercise.id,
                  })
                }
                disabled={deleteExercise.isPending}
              >
                <Trash2Icon className="text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {exercise.sets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  세트가 없습니다.
                </p>
              ) : (
                exercise.sets.map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {set.setIndex}세트 · {set.weight}kg × {set.reps}회
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        deleteSet.mutate({ date: today, setId: set.id })
                      }
                      disabled={deleteSet.isPending}
                    >
                      <Trash2Icon className="text-muted-foreground" />
                    </Button>
                  </div>
                ))
              )}

              <div className="grid grid-cols-3 gap-2 pt-2">
                <Field>
                  <FieldLabel htmlFor={`weight-${exercise.id}`}>kg</FieldLabel>
                  <Input
                    id={`weight-${exercise.id}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder="0"
                    value={setForms[exercise.id]?.weight ?? ""}
                    onChange={(e) =>
                      setSetForms((prev) => ({
                        ...prev,
                        [exercise.id]: {
                          weight: e.target.value,
                          reps: prev[exercise.id]?.reps ?? "",
                        },
                      }))
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor={`reps-${exercise.id}`}>reps</FieldLabel>
                  <Input
                    id={`reps-${exercise.id}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="0"
                    value={setForms[exercise.id]?.reps ?? ""}
                    onChange={(e) =>
                      setSetForms((prev) => ({
                        ...prev,
                        [exercise.id]: {
                          weight: prev[exercise.id]?.weight ?? "",
                          reps: e.target.value,
                        },
                      }))
                    }
                  />
                </Field>

                <div className="flex items-end">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => handleAddSet(exercise.id)}
                    disabled={addSet.isPending}
                  >
                    <PlusIcon data-icon="inline-start" />
                    세트
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {exercises.length === 0 && !isFormOpen && (
          <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
            기록된 운동이 없습니다.
          </div>
        )}
      </div>

      {isFormOpen ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">운동 추가</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsFormOpen(false)}
            >
              <XIcon />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExercise} className="space-y-3">
              <Field>
                <FieldLabel htmlFor="exerciseName">종목명</FieldLabel>
                <Input
                  id="exerciseName"
                  type="text"
                  placeholder="예: Bench Press"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  required
                />
              </Field>

              <Button
                type="submit"
                className="w-full"
                disabled={addExercise.isPending}
              >
                {addExercise.isPending ? "저장 중..." : "저장"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="w-full"
        >
          <PlusIcon data-icon="inline-start" />
          운동 추가
        </Button>
      )}
    </div>
  );
}
