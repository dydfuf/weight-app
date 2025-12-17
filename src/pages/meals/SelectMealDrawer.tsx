import { Coffee, Cookie, Moon, Utensils } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { MealType } from "@/domain/meals/types";

interface SelectMealDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMealType: (mealType: MealType) => void;
}

const MEAL_TYPE_CONFIG: Record<
  MealType,
  { label: string; icon: typeof Coffee; description: string }
> = {
  breakfast: {
    label: "아침",
    icon: Coffee,
    description: "아침 식사",
  },
  lunch: {
    label: "점심",
    icon: Utensils,
    description: "점심 식사",
  },
  dinner: {
    label: "저녁",
    icon: Moon,
    description: "저녁 식사",
  },
  snack: {
    label: "간식",
    icon: Cookie,
    description: "간식 및 음료",
  },
};

const MEAL_TYPE_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export function SelectMealDrawer({
  open,
  onOpenChange,
  onSelectMealType,
}: SelectMealDrawerProps) {
  const handleSelect = (mealType: MealType) => {
    onOpenChange(false);
    onSelectMealType(mealType);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>식사 종류 선택</DrawerTitle>
          <DrawerDescription>
            음식을 추가할 식사를 선택하세요.
          </DrawerDescription>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-3 p-4">
          {MEAL_TYPE_ORDER.map((mealType) => {
            const config = MEAL_TYPE_CONFIG[mealType];
            const Icon = config.icon;

            return (
              <button
                key={mealType}
                type="button"
                onClick={() => handleSelect(mealType)}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-all hover:border-primary hover:bg-primary/5 active:scale-95"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium">{config.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="h-4" />
      </DrawerContent>
    </Drawer>
  );
}
