import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <section className="space-y-4 py-4">
      <div className="h-6 w-24 rounded bg-muted" />
      <div className="h-4 w-64 rounded bg-muted/70" />

      <div className="h-28 w-full rounded-lg bg-muted/50" />

      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded bg-muted" />
                  <div className="h-3 w-64 rounded bg-muted/70" />
                </div>
                <div className="flex gap-1">
                  <div className="h-5 w-10 rounded bg-muted" />
                  <div className="h-5 w-12 rounded bg-muted" />
                  <div className="h-5 w-12 rounded bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
