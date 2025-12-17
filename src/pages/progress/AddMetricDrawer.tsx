import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { MetricType } from "@/domain/metrics/types";
import { useCreateMetricEntry } from "@/features/metrics/mutations";

interface AddMetricDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: MetricType;
  label: string;
  unit: string;
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function AddMetricDrawer({
  open,
  onOpenChange,
  type,
  label,
  unit,
}: AddMetricDrawerProps) {
  const today = getTodayDateString();

  const [formData, setFormData] = useState({
    date: today,
    value: "",
  });

  const createEntry = useCreateMetricEntry();

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
        unit,
      },
      {
        onSuccess: () => {
          setFormData({ date: today, value: "" });
          onOpenChange(false);
        },
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form when closing
      setFormData({ date: today, value: "" });
    }
    onOpenChange(isOpen);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{label} 기록</DrawerTitle>
          <DrawerDescription>오늘의 {label}을 기록하세요.</DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4">
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
            <FieldLabel htmlFor="metricValue">값 ({unit})</FieldLabel>
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
              autoFocus
              required
            />
          </Field>
        </form>
        <DrawerFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={createEntry.isPending || !formData.value}
          >
            {createEntry.isPending ? "저장 중..." : "저장"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">취소</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
