import { useState } from "react";
import { useSearchParams } from "react-router";

import { FAB } from "@/components/fab";

import type { MetricEntry, MetricType } from "@/domain/metrics/types";
import { useGoals } from "@/features/goals/queries";
import { useDeleteMetricEntry } from "@/features/metrics/mutations";
import {
  useLatestMetricByType,
  useMetricEntriesByType,
} from "@/features/metrics/queries";

import {
  AddMetricDrawer,
  HistoryList,
  MetricChart,
  MetricChips,
  OverviewCards,
} from "./progress";

const METRIC_LABELS: Record<MetricType, string> = {
  weight: "체중",
  bodyFat: "체지방률",
};

const METRIC_UNITS: Record<MetricType, string> = {
  weight: "kg",
  bodyFat: "%",
};

export function ProgressPage() {
  const [searchParams] = useSearchParams();
  const [type, setType] = useState<MetricType>(() => {
    const t = searchParams.get("type");
    return t === "weight" || t === "bodyFat" ? t : "weight";
  });

  const { data: latest, isLoading: isLatestLoading } =
    useLatestMetricByType(type);
  const { data: rawEntries = [], isLoading: isEntriesLoading } =
    useMetricEntriesByType(type);
  const { data: goals } = useGoals();

  const deleteEntry = useDeleteMetricEntry();

  const [isDrawerOpen, setIsDrawerOpen] = useState(
    () => searchParams.get("add") === "1"
  );

  const handleDelete = (entry: MetricEntry) => {
    deleteEntry.mutate({ id: entry.id, type: entry.type });
  };

  if (isLatestLoading || isEntriesLoading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pb-24">
      {/* Header */}
      <header>
        <h1 className="mb-3 text-lg font-semibold">변화</h1>
        {/* Metric Chips - Phase 3 */}
        <MetricChips value={type} onChange={setType} />
      </header>

      {/* Chart Section - Phase 1 */}
      <MetricChart
        entries={rawEntries}
        latest={latest}
        type={type}
        unit={METRIC_UNITS[type]}
        label={METRIC_LABELS[type]}
      />

      {/* Overview Cards - Phase 2 */}
      <OverviewCards
        entries={rawEntries}
        latest={latest}
        goals={goals}
        type={type}
        unit={METRIC_UNITS[type]}
        label={METRIC_LABELS[type]}
      />

      {/* History List - Phase 4 */}
      <HistoryList
        entries={rawEntries}
        type={type}
        unit={METRIC_UNITS[type]}
        onDelete={handleDelete}
        isDeleting={deleteEntry.isPending}
      />

      {/* Empty State */}
      {rawEntries.length === 0 && (
        <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
          기록된 데이터가 없습니다. 첫 번째 기록을 추가해보세요!
        </div>
      )}

      {/* Add Metric Drawer */}
      <AddMetricDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        type={type}
        label={METRIC_LABELS[type]}
        unit={METRIC_UNITS[type]}
      />

      {/* FAB Button */}
      <FAB
        onClick={() => setIsDrawerOpen(true)}
        label={`${METRIC_LABELS[type]} 기록 추가`}
      />
    </div>
  );
}
