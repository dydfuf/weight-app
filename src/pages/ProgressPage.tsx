import { useState } from "react";
import { useSearchParams } from "react-router";
import { PlusIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { MetricEntry, MetricType } from "@/domain/metrics/types";
import { useGoals } from "@/features/goals/queries";
import {
  useCreateMetricEntry,
  useDeleteMetricEntry,
} from "@/features/metrics/mutations";
import {
  useLatestMetricByType,
  useMetricEntriesByType,
} from "@/features/metrics/queries";

import {
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

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function ProgressPage() {
  const today = getTodayDateString();

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

  const createEntry = useCreateMetricEntry();
  const deleteEntry = useDeleteMetricEntry();

  const [isFormOpen, setIsFormOpen] = useState(
    () => searchParams.get("add") === "1"
  );
  const [formData, setFormData] = useState({
    date: today,
    value: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.value) return;

    const value = Number(formData.value);
    if (!Number.isFinite(value)) return;

    createEntry.mutate(
      {
        date: formData.date,
        type,
        value,
        unit: METRIC_UNITS[type],
      },
      {
        onSuccess: () => {
          setFormData({ date: today, value: "" });
          setIsFormOpen(false);
        },
      }
    );
  };

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
      {rawEntries.length === 0 && !isFormOpen && (
        <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
          기록된 데이터가 없습니다. 첫 번째 기록을 추가해보세요!
        </div>
      )}

      {/* Add Form */}
      {isFormOpen && (
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">
              {METRIC_LABELS[type]} 기록
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsFormOpen(false)}
            >
              <XIcon />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field>
                <FieldLabel htmlFor="metricDate">날짜</FieldLabel>
                <Input
                  id="metricDate"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="metricValue">
                  값 ({METRIC_UNITS[type]})
                </FieldLabel>
                <Input
                  id="metricValue"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder="0"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, value: e.target.value }))
                  }
                  required
                />
              </Field>

              <Button
                type="submit"
                className="w-full"
                disabled={createEntry.isPending}
              >
                {createEntry.isPending ? "저장 중..." : "저장"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* FAB Button - Phase 5 */}
      {!isFormOpen && (
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-20 right-4 z-40 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95"
          aria-label={`${METRIC_LABELS[type]} 기록 추가`}
        >
          <PlusIcon className="size-6" />
        </button>
      )}
    </div>
  );
}
