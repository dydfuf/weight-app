import { ComponentExample } from "@/components/component-example";
import { useQuery } from "@tanstack/react-query";

export function DashboardPage() {
  // Smoke test: ensures TanStack Query is wired correctly.
  useQuery({
    queryKey: ["__rq_smoke"],
    queryFn: async () => "ok",
    staleTime: Infinity,
  });

  return <ComponentExample />;
}
