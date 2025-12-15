import { useState, useMemo } from "react";
import { Trash2Icon, PlusIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";

import { useFoodEntriesByDate } from "@/features/meals/queries";
import {
  useAddFoodEntry,
  useDeleteFoodEntry,
} from "@/features/meals/mutations";
import type { FoodEntry, MealType } from "@/domain/meals/types";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

const MEAL_TYPE_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function MealsPage() {
  const today = getTodayDateString();
  const { data: entries = [], isLoading } = useFoodEntriesByDate(today);
  const addEntry = useAddFoodEntry();
  const deleteEntry = useDeleteFoodEntry();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    mealType: "lunch" as MealType,
  });

  // Group entries by meal type
  const entriesByMealType = useMemo(() => {
    const grouped: Record<MealType, FoodEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    entries.forEach((entry) => {
      grouped[entry.mealType].push(entry);
    });
    return grouped;
  }, [entries]);

  // Calculate daily totals
  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + (entry.protein ?? 0),
        carbs: acc.carbs + (entry.carbs ?? 0),
        fat: acc.fat + (entry.fat ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.calories) return;

    addEntry.mutate(
      {
        date: today,
        mealType: formData.mealType,
        name: formData.name,
        calories: Number(formData.calories),
        protein: formData.protein ? Number(formData.protein) : undefined,
        carbs: formData.carbs ? Number(formData.carbs) : undefined,
        fat: formData.fat ? Number(formData.fat) : undefined,
      },
      {
        onSuccess: () => {
          setFormData({
            name: "",
            calories: "",
            protein: "",
            carbs: "",
            fat: "",
            mealType: "lunch",
          });
          setIsFormOpen(false);
        },
      }
    );
  };

  const handleDelete = (entry: FoodEntry) => {
    deleteEntry.mutate({ id: entry.id, date: entry.date });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header with daily summary */}
      <header className="space-y-2">
        <h1 className="text-lg font-semibold">식단</h1>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{totals.calories}</span>
          <span className="text-sm text-muted-foreground">kcal</span>
        </div>
        {(totals.protein > 0 || totals.carbs > 0 || totals.fat > 0) && (
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>탄 {totals.carbs}g</span>
            <span>단 {totals.protein}g</span>
            <span>지 {totals.fat}g</span>
          </div>
        )}
      </header>

      {/* Food entries grouped by meal type */}
      <div className="space-y-3">
        {MEAL_TYPE_ORDER.map((mealType) => {
          const mealEntries = entriesByMealType[mealType];
          if (mealEntries.length === 0) return null;

          return (
            <Card key={mealType}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {MEAL_TYPE_LABELS[mealType]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mealEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.calories} kcal
                        {entry.protein !== undefined &&
                          ` · 단 ${entry.protein}g`}
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
          );
        })}

        {entries.length === 0 && !isFormOpen && (
          <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">
            기록된 음식이 없습니다.
          </div>
        )}
      </div>

      {/* Add food form */}
      {isFormOpen ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">음식 추가</CardTitle>
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
                <FieldLabel htmlFor="mealType">식사</FieldLabel>
                <Select
                  value={formData.mealType}
                  onValueChange={(value: MealType) =>
                    setFormData((prev) => ({ ...prev, mealType: value }))
                  }
                >
                  <SelectTrigger id="mealType" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPE_ORDER.map((type) => (
                      <SelectItem key={type} value={type}>
                        {MEAL_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="name">음식명</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="예: 닭가슴살 샐러드"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="calories">칼로리 (kcal)</FieldLabel>
                <Input
                  id="calories"
                  type="number"
                  placeholder="350"
                  value={formData.calories}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      calories: e.target.value,
                    }))
                  }
                  required
                  min={0}
                />
              </Field>

              <div className="grid grid-cols-3 gap-2">
                <Field>
                  <FieldLabel htmlFor="carbs">탄수화물</FieldLabel>
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="g"
                    value={formData.carbs}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        carbs: e.target.value,
                      }))
                    }
                    min={0}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="protein">단백질</FieldLabel>
                  <Input
                    id="protein"
                    type="number"
                    placeholder="g"
                    value={formData.protein}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        protein: e.target.value,
                      }))
                    }
                    min={0}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="fat">지방</FieldLabel>
                  <Input
                    id="fat"
                    type="number"
                    placeholder="g"
                    value={formData.fat}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, fat: e.target.value }))
                    }
                    min={0}
                  />
                </Field>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={addEntry.isPending}
              >
                {addEntry.isPending ? "저장 중..." : "저장"}
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
          음식 추가
        </Button>
      )}
    </div>
  );
}
