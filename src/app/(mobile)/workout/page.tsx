import { Suspense } from "react";
import { ExerciseFilters } from "@/components/workout/exercise-filters";
import { ExerciseList } from "@/components/workout/exercise-list";

export default async function WorkoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const difficulty = typeof params.difficulty === "string" ? params.difficulty : undefined;
  const mechanic = typeof params.mechanic === "string" ? params.mechanic : undefined;
  const plane = typeof params.plane === "string" ? params.plane : undefined;
  const unilateral = typeof params.unilateral === "string" ? params.unilateral : undefined;

  return (
    <section className="space-y-4 py-4">
      <h1 className="text-xl font-semibold">운동</h1>
      <p className="text-sm text-muted-foreground">운동을 기록하고 관리하세요.</p>

      <ExerciseFilters />

      <Suspense fallback={<div className="text-sm text-muted-foreground">로딩 중…</div>}>
        <ExerciseList
          q={q}
          difficulty={difficulty}
          mechanic={mechanic}
          plane={plane}
          unilateral={unilateral}
        />
      </Suspense>
    </section>
  );
}
