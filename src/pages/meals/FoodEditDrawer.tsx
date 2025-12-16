import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useUpdateFoodEntry } from "@/features/meals/mutations";
import type { FoodEntry, MealType } from "@/domain/meals/types";

interface FoodEditDrawerProps {
  entry: FoodEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};

const MEAL_TYPE_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export function FoodEditDrawer({
  entry,
  open,
  onOpenChange,
}: FoodEditDrawerProps) {
  const updateEntry = useUpdateFoodEntry();

  const [formData, setFormData] = useState({
    name: entry.name,
    calories: String(entry.calories),
    protein: entry.protein !== undefined ? String(entry.protein) : "",
    carbs: entry.carbs !== undefined ? String(entry.carbs) : "",
    fat: entry.fat !== undefined ? String(entry.fat) : "",
    quantity: entry.quantity !== undefined ? String(entry.quantity) : "",
    mealType: entry.mealType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.calories) return;

    updateEntry.mutate(
      {
        id: entry.id,
        input: {
          name: formData.name,
          calories: Number(formData.calories),
          protein: formData.protein ? Number(formData.protein) : undefined,
          carbs: formData.carbs ? Number(formData.carbs) : undefined,
          fat: formData.fat ? Number(formData.fat) : undefined,
          quantity: formData.quantity ? Number(formData.quantity) : undefined,
          mealType: formData.mealType,
        },
        previousDate: entry.date,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  // Reset form when drawer opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setFormData({
        name: entry.name,
        calories: String(entry.calories),
        protein: entry.protein !== undefined ? String(entry.protein) : "",
        carbs: entry.carbs !== undefined ? String(entry.carbs) : "",
        fat: entry.fat !== undefined ? String(entry.fat) : "",
        quantity: entry.quantity !== undefined ? String(entry.quantity) : "",
        mealType: entry.mealType,
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>음식 수정</DrawerTitle>
          <DrawerDescription>음식 정보를 수정합니다.</DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="px-4 space-y-3">
          <Field>
            <FieldLabel htmlFor="edit-mealType">식사</FieldLabel>
            <Select
              value={formData.mealType}
              onValueChange={(value: MealType) =>
                setFormData((prev) => ({ ...prev, mealType: value }))
              }
            >
              <SelectTrigger id="edit-mealType" className="w-full">
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
            <FieldLabel htmlFor="edit-name">음식명</FieldLabel>
            <Input
              id="edit-name"
              type="text"
              placeholder="예: 닭가슴살 샐러드"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel htmlFor="edit-calories">칼로리 (kcal)</FieldLabel>
              <Input
                id="edit-calories"
                type="number"
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
              <FieldLabel htmlFor="edit-quantity">인분</FieldLabel>
              <Input
                id="edit-quantity"
                type="number"
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
              <FieldLabel htmlFor="edit-carbs">탄수화물</FieldLabel>
              <Input
                id="edit-carbs"
                type="number"
                placeholder="g"
                value={formData.carbs}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, carbs: e.target.value }))
                }
                min={0}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-protein">단백질</FieldLabel>
              <Input
                id="edit-protein"
                type="number"
                placeholder="g"
                value={formData.protein}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, protein: e.target.value }))
                }
                min={0}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-fat">지방</FieldLabel>
              <Input
                id="edit-fat"
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
        </form>

        <DrawerFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={updateEntry.isPending}
          >
            {updateEntry.isPending ? "저장 중..." : "저장"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">취소</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
