import { Button } from "@/components/ui/button";

export function WorkoutsPage() {
  return (
    <div className="space-y-4 p-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">운동</h1>
        <p className="text-sm text-muted-foreground">오늘 0세트</p>
      </header>

      <section className="rounded-md border p-4 text-sm text-muted-foreground">
        기록된 운동이 없습니다.
      </section>

      <div>
        <Button type="button">운동 추가</Button>
      </div>
    </div>
  );
}
