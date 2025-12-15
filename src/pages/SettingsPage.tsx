import { UserProfile } from "@clerk/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useClearGoals, useSetGoals } from "@/features/goals/mutations";
import { useGoals } from "@/features/goals/queries";

export function SettingsPage() {
  const { data: goals, isLoading } = useGoals();
  const setGoals = useSetGoals();
  const clearGoals = useClearGoals();

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = String(formData.get("dailyCalories") ?? "").trim();
    const value = raw === "" ? undefined : Number(raw);
    if (value !== undefined && !Number.isFinite(value)) return;

    setGoals.mutate({
      dailyCalories: value,
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">목표</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleSave} className="space-y-3">
            <Field>
              <FieldLabel htmlFor="dailyCalories">
                일일 칼로리 (kcal)
              </FieldLabel>
              <Input
                key={goals?.updatedAt ?? "no-goals"}
                id="dailyCalories"
                name="dailyCalories"
                type="number"
                min={0}
                placeholder="예: 2000"
                defaultValue={
                  goals?.dailyCalories !== undefined ? goals.dailyCalories : ""
                }
                disabled={isLoading}
              />
            </Field>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={setGoals.isPending || isLoading}
              >
                {setGoals.isPending ? "저장 중..." : "저장"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => clearGoals.mutate()}
                disabled={clearGoals.isPending || isLoading}
              >
                초기화
              </Button>
            </div>

            {goals?.dailyCalories !== undefined && (
              <p className="text-xs text-muted-foreground">
                현재 목표: {goals.dailyCalories} kcal
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <UserProfile path="/app/settings" />
      </div>
    </div>
  );
}
