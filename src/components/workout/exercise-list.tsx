import Link from "next/link";
import { seedSampleExercises } from "@/app/(mobile)/workout/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "../../../database.types";

type Exercise = Tables<"exercises">;

export async function ExerciseList({
  q,
  difficulty,
  mechanic,
  plane,
  unilateral,
}: {
  q?: string;
  difficulty?: Enums<"difficulty_level"> | string;
  mechanic?: Enums<"mechanic_type"> | string;
  plane?: Enums<"plane_of_motion"> | string;
  unilateral?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("exercises")
    .select("id, name, slug, difficulty, mechanic, plane, unilateral, description")
    .order("name", { ascending: true });

  // 기본: 모든 운동 노출(가시성/소유자 제한 없음)

  if (q && q.trim().length > 0) {
    // Basic ilike search; can be replaced with tsvector later
    query = query.ilike("name", `%${q.trim()}%`);
  }
  if (difficulty && ["beginner", "intermediate", "advanced"].includes(difficulty)) {
    query = query.eq("difficulty", difficulty as Enums<"difficulty_level">);
  }
  if (mechanic && ["compound", "isolation"].includes(mechanic)) {
    query = query.eq("mechanic", mechanic as Enums<"mechanic_type">);
  }
  if (plane && ["sagittal", "frontal", "transverse", "multi"].includes(plane)) {
    query = query.eq("plane", plane as Enums<"plane_of_motion">);
  }
  if (unilateral === "true" || unilateral === "false")
    query = query.eq("unilateral", unilateral === "true");

  const { data, error } = await query;

  if (error) {
    return <div className="text-sm text-destructive">문제가 발생했습니다: {error.message}</div>;
  }

  const items = (data ?? []) as Pick<
    Exercise,
    "id" | "name" | "slug" | "difficulty" | "mechanic" | "plane" | "unilateral" | "description"
  >[];

  if (items.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-sm">
        <p className="text-muted-foreground">일치하는 운동이 없습니다.</p>
        <form action={seedSampleExercises} className="mt-3">
          <Button type="submit" size="sm">
            샘플 운동 불러오기
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((ex) => (
        <Link key={ex.id} href={`/workout/${ex.slug}`} className="block">
          <Card className="hover:bg-accent/40 transition-colors">
            <CardContent className="py-4">
              <div className="flex flex-col gap-2">
                <div className="min-w-0">
                  <div className="font-medium leading-tight whitespace-normal break-words">{ex.name}</div>
                  {ex.description && (
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {ex.description}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{ex.difficulty}</Badge>
                  <Badge variant="outline">{ex.mechanic}</Badge>
                  <Badge variant="outline">{ex.plane}</Badge>
                  <Badge variant="outline">{ex.unilateral ? "단측" : "양측"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default ExerciseList;
