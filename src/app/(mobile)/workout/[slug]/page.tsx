import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "../../../../../database.types";

type Exercise = Tables<"exercises">;

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exercises")
    .select(
      "id, name, slug, difficulty, mechanic, plane, unilateral, description, instruction_steps, media",
    )
    .eq("slug", slug)
    .eq("visibility", "public")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) return notFound();

  const ex = data as Pick<
    Exercise,
    | "id"
    | "name"
    | "slug"
    | "difficulty"
    | "mechanic"
    | "plane"
    | "unilateral"
    | "description"
    | "instruction_steps"
    | "media"
  >;

  const steps = Array.isArray(ex.instruction_steps)
    ? (ex.instruction_steps as unknown as string[])
    : [];

  return (
    <section className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{ex.name}</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/workout">목록</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{ex.difficulty}</Badge>
        <Badge variant="outline">{ex.mechanic}</Badge>
        <Badge variant="outline">{ex.plane}</Badge>
        <Badge variant="outline">{ex.unilateral ? "단측" : "양측"}</Badge>
      </div>

      {ex.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">설명</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{ex.description}</p>
          </CardContent>
        </Card>
      )}

      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">운동 방법</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-1 pl-4 text-sm">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
