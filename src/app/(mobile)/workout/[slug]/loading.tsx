export default function Loading() {
  return (
    <section className="space-y-4 py-4">
      <div className="h-6 w-32 rounded bg-muted" />
      <div className="flex gap-2">
        <div className="h-5 w-14 rounded bg-muted" />
        <div className="h-5 w-16 rounded bg-muted" />
        <div className="h-5 w-16 rounded bg-muted" />
      </div>
      <div className="h-24 w-full rounded-lg bg-muted/60" />
      <div className="h-40 w-full rounded-lg bg-muted/40" />
    </section>
  );
}
