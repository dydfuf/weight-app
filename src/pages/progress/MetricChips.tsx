import { PercentIcon, ScaleIcon } from "lucide-react";

import type { MetricType } from "@/domain/metrics/types";

const METRIC_CONFIG: Record<
  MetricType,
  { label: string; icon: React.ElementType }
> = {
  weight: { label: "체중", icon: ScaleIcon },
  bodyFat: { label: "체지방률", icon: PercentIcon },
};

interface MetricChipsProps {
  value: MetricType;
  onChange: (type: MetricType) => void;
}

export function MetricChips({ value, onChange }: MetricChipsProps) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {(Object.keys(METRIC_CONFIG) as MetricType[]).map((type) => {
        const config = METRIC_CONFIG[type];
        const Icon = config.icon;
        const isActive = value === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
