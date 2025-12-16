import { useState, useMemo } from "react";
import { PlusIcon, Coffee, Utensils, Moon, Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FoodEntry, MealType } from "@/domain/meals/types";

import { FoodItemRow } from "./FoodItemRow";
import { AddFoodForm } from "./AddFoodForm";

interface MealSectionProps {
  mealType: MealType;
  entries: FoodEntry[];
  date: string;
}

const MEAL_TYPE_CONFIG: Record<
  MealType,
  { label: string; icon: typeof Coffee }
> = {
  breakfast: { label: "아침", icon: Coffee },
  lunch: { label: "점심", icon: Utensils },
  dinner: { label: "저녁", icon: Moon },
  snack: { label: "간식", icon: Cookie },
};

export function MealSection({ mealType, entries, date }: MealSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const config = MEAL_TYPE_CONFIG[mealType];
  const Icon = config.icon;

  const totalCalories = useMemo(() => {
    return entries.reduce((sum, entry) => sum + entry.calories, 0);
  }, [entries]);

  const isEmpty = entries.length === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">
            {config.label}
          </CardTitle>
        </div>
        <span className="text-sm text-muted-foreground">
          {totalCalories.toLocaleString()} kcal
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        {isEmpty && !isFormOpen ? (
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 p-6 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm">기록된 음식이 없습니다</span>
            <span className="text-xs font-medium text-primary">
              {config.label} 추가하기
            </span>
          </button>
        ) : (
          <>
            {entries.map((entry) => (
              <FoodItemRow key={entry.id} entry={entry} />
            ))}

            {isFormOpen ? (
              <AddFoodForm
                date={date}
                mealType={mealType}
                onClose={() => setIsFormOpen(false)}
              />
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFormOpen(true)}
                className="w-full justify-center text-primary"
              >
                <PlusIcon data-icon="inline-start" />
                음식 추가
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
