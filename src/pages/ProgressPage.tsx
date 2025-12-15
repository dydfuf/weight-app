import { Button } from "@/components/ui/button";

export function ProgressPage() {
  return (
    <div className="space-y-4 p-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">변화</h1>
        <p className="text-sm text-muted-foreground">체중 추이</p>
      </header>

      <section className="rounded-md border p-4 text-sm text-muted-foreground">
        기록된 데이터가 없습니다.
      </section>

      <div>
        <Button type="button">체중 기록</Button>
      </div>
    </div>
  );
}
