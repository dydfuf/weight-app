import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { MetricEntry, MetricType } from "@/domain/metrics/types";
import {
  useCreateMetricEntry,
  useDeleteMetricEntry,
} from "@/features/metrics/mutations";
import {
  useLatestMetricByType,
  useMetricEntriesByType,
} from "@/features/metrics/queries";

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

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
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

  const createEntry = useCreateMetricEntry();
  const deleteEntry = useDeleteMetricEntry();

  const entries = useMemo(() => {
    // Show newest first in the UI (repository returns date asc)
    return [...rawEntries].sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
    );
  }, [rawEntries]);

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
    <div className="space-y-4 p-4">
      <header className="space-y-2">
        <h1 className="text-lg font-semibold">변화</h1>
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {METRIC_LABELS[type]} 최신값
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {latest ? latest.value : "-"}
              </span>
              <span className="text-sm text-muted-foreground">
                {METRIC_UNITS[type]}
              </span>
            </div>
          </div>
          <div className="w-36">
            <Field>
              <FieldLabel htmlFor="metricType">지표</FieldLabel>
              <Select
                value={type}
                onValueChange={(v: MetricType) => setType(v)}
              >
                <SelectTrigger id="metricType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(METRIC_LABELS) as MetricType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {METRIC_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {entries.length === 0 && !isFormOpen ? (
          <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
            기록된 데이터가 없습니다.
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                기록
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {entry.value} {entry.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.date} · {formatTime(entry.createdAt)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(entry)}
                    disabled={deleteEntry.isPending}
                  >
                    <Trash2Icon className="text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {isFormOpen ? (
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
      ) : (
        <Button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="w-full"
        >
          <PlusIcon data-icon="inline-start" />
          {METRIC_LABELS[type]} 기록
        </Button>
      )}
    </div>
  );
}
