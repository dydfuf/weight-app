import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { DateNavigator } from "@/components/date-navigation";
import { FAB } from "@/components/fab";
import type { FoodEntry, MealType } from "@/domain/meals/types";
import { useGoals } from "@/features/goals/queries";
import { useFoodEntriesByDate } from "@/features/meals/queries";

import { AddFoodDrawer } from "./AddFoodDrawer";
import { DailySummaryCard } from "./DailySummaryCard";
import { MealSection } from "./MealSection";
import { MealsHeader } from "./MealsHeader";
import { SelectMealDrawer } from "./SelectMealDrawer";

const MEAL_TYPE_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function MealsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDate = searchParams.get("date") || getTodayDateString();

  const { data: entries = [], isLoading } = useFoodEntriesByDate(selectedDate);
  const { data: goals } = useGoals();

  // Drawer states for FAB flow
  const [isSelectMealOpen, setIsSelectMealOpen] = useState(false);
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(
    null
  );

  const handleDateChange = (date: string) => {
    setSearchParams({ date });
  };

  const handleSelectMealType = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setIsAddFoodOpen(true);
  };

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

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-md p-4">
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-14 animate-pulse rounded bg-muted" />
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4 p-4 pb-24">
      <MealsHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
      <DailySummaryCard
        totals={totals}
        calorieGoal={goals?.dailyCalories}
        macroTargets={goals?.macroTargets}
      />
      <div className="space-y-4">
        {MEAL_TYPE_ORDER.map((mealType) => (
          <MealSection
            key={mealType}
            mealType={mealType}
            entries={entriesByMealType[mealType]}
            date={selectedDate}
          />
        ))}
      </div>

      {/* Select Meal Type Drawer */}
      <SelectMealDrawer
        open={isSelectMealOpen}
        onOpenChange={setIsSelectMealOpen}
        onSelectMealType={handleSelectMealType}
      />

      {/* Add Food Drawer */}
      <AddFoodDrawer
        open={isAddFoodOpen}
        onOpenChange={setIsAddFoodOpen}
        date={selectedDate}
        mealType={selectedMealType}
      />

      {/* FAB Button */}
      <FAB onClick={() => setIsSelectMealOpen(true)} label="음식 추가" />
    </div>
  );
}
