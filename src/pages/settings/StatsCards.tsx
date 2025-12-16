import { Flame, TrendingDown } from "lucide-react";

import { Card } from "@/components/ui/card";

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="relative overflow-hidden p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />
          Streak
        </div>
        <p className="mt-2 text-3xl font-bold leading-none">
          12{" "}
          <span className="text-base font-normal text-muted-foreground">
            Days
          </span>
        </p>
      </Card>

      <Card className="relative overflow-hidden p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingDown className="h-5 w-5 text-primary" aria-hidden="true" />
          Lost
        </div>
        <p className="mt-2 text-3xl font-bold leading-none">
          4.5{" "}
          <span className="text-base font-normal text-muted-foreground">
            kg
          </span>
        </p>
      </Card>
    </div>
  );
}
