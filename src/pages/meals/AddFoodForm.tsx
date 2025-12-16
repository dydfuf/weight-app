import { useState } from "react";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { useAddFoodEntry } from "@/features/meals/mutations";
import type { MealType } from "@/domain/meals/types";

interface AddFoodFormProps {
  date: string;
  mealType: MealType;
  onClose: () => void;
}

export function AddFoodForm({ date, mealType, onClose }: AddFoodFormProps) {
  const addEntry = useAddFoodEntry();

  const [formData, setFormData] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    quantity: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.calories) return;

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
          setFormData({
            name: "",
            calories: "",
            protein: "",
            carbs: "",
            fat: "",
            quantity: "",
          });
          onClose();
        },
      }
    );
  };

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">음식 추가</p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose}>
          <XIcon />
          <span className="sr-only">닫기</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field>
          <FieldLabel htmlFor={`add-name-${mealType}`}>음식명</FieldLabel>
          <Input
            id={`add-name-${mealType}`}
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
            <FieldLabel htmlFor={`add-calories-${mealType}`}>
              칼로리 (kcal)
            </FieldLabel>
            <Input
              id={`add-calories-${mealType}`}
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
            <FieldLabel htmlFor={`add-quantity-${mealType}`}>인분</FieldLabel>
            <Input
              id={`add-quantity-${mealType}`}
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
            <FieldLabel htmlFor={`add-carbs-${mealType}`}>탄수화물</FieldLabel>
            <Input
              id={`add-carbs-${mealType}`}
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
            <FieldLabel htmlFor={`add-protein-${mealType}`}>단백질</FieldLabel>
            <Input
              id={`add-protein-${mealType}`}
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
            <FieldLabel htmlFor={`add-fat-${mealType}`}>지방</FieldLabel>
            <Input
              id={`add-fat-${mealType}`}
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
          size="sm"
          className="w-full"
          disabled={addEntry.isPending}
        >
          {addEntry.isPending ? "저장 중..." : "저장"}
        </Button>
      </form>
    </div>
  );
}
