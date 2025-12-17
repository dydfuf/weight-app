import { useState } from "react";
import { Coffee, Cookie, Moon, Utensils } from "lucide-react";

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
import type { MealType } from "@/domain/meals/types";
import { useAddFoodEntry } from "@/features/meals/mutations";

interface AddFoodDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  mealType: MealType | null;
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

const initialFormData = {
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  quantity: "",
};

export function AddFoodDrawer({
  open,
  onOpenChange,
  date,
  mealType,
}: AddFoodDrawerProps) {
  const [formData, setFormData] = useState(initialFormData);

  const addEntry = useAddFoodEntry();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialFormData);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.calories || !mealType) return;

    addEntry.mutate(
      {
        date,
        mealType,
        name: formData.name,
        calories: Number(formData.calories),
        protein: formData.protein ? Number(formData.protein) : undefined,
        carbs: formData.carbs ? Number(formData.carbs) : undefined,
        fat: formData.fat ? Number(formData.fat) : undefined,
        quantity: formData.quantity ? Number(formData.quantity) : undefined,
      },
      {
        onSuccess: () => {
          setFormData(initialFormData);
          onOpenChange(false);
        },
      }
    );
  };

  if (!mealType) return null;

  const config = MEAL_TYPE_CONFIG[mealType];
  const Icon = config.icon;

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
            <div>
              <DrawerTitle>{config.label} 음식 추가</DrawerTitle>
              <DrawerDescription>음식 정보를 입력하세요.</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4">
          <Field>
            <FieldLabel htmlFor="food-name">음식명</FieldLabel>
            <Input
              id="food-name"
              type="text"
              placeholder="예: 닭가슴살 샐러드"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              autoFocus
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="food-calories">칼로리 (kcal)</FieldLabel>
              <Input
                id="food-calories"
                type="number"
                inputMode="numeric"
                placeholder="350"
                value={formData.calories}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, calories: e.target.value }))
                }
                required
                min={0}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="food-quantity">인분</FieldLabel>
              <Input
                id="food-quantity"
                type="number"
                inputMode="decimal"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
                min={0}
                step={0.5}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Field>
              <FieldLabel htmlFor="food-carbs">탄수화물 (g)</FieldLabel>
              <Input
                id="food-carbs"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={formData.carbs}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, carbs: e.target.value }))
                }
                min={0}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="food-protein">단백질 (g)</FieldLabel>
              <Input
                id="food-protein"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={formData.protein}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, protein: e.target.value }))
                }
                min={0}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="food-fat">지방 (g)</FieldLabel>
              <Input
                id="food-fat"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={formData.fat}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fat: e.target.value }))
                }
                min={0}
              />
            </Field>
          </div>
        </form>
        <DrawerFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={
              addEntry.isPending || !formData.name || !formData.calories
            }
          >
            {addEntry.isPending ? "저장 중..." : "저장"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">취소</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
