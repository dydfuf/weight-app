import { Button } from "@/components/ui/button";

export function MealsPage() {
  return (
    <div className="space-y-4 p-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">식단</h1>
        <p className="text-sm text-muted-foreground">오늘 총 0 kcal</p>
      </header>

      <section className="rounded-md border p-4 text-sm text-muted-foreground">
        기록된 음식이 없습니다.
      </section>

      <div>
        <Button type="button">음식 추가</Button>
      </div>
    </div>
  );
}
