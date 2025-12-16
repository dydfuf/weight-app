import { useState } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDeleteFoodEntry } from "@/features/meals/mutations";
import type { FoodEntry } from "@/domain/meals/types";

import { FoodEditDrawer } from "./FoodEditDrawer";

interface FoodItemRowProps {
  entry: FoodEntry;
}

export function FoodItemRow({ entry }: FoodItemRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteEntry = useDeleteFoodEntry();

  const handleDelete = () => {
    deleteEntry.mutate({ id: entry.id, date: entry.date });
  };

  const servingText = entry.quantity ? `${entry.quantity}인분` : undefined;

  return (
    <>
      <div className="group flex items-center justify-between gap-2 rounded-lg p-2 transition-colors hover:bg-muted/50">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{entry.name}</p>
          <p className="text-xs text-muted-foreground">
            {entry.calories} kcal
            {servingText && ` · ${servingText}`}
            {entry.protein !== undefined && ` · 단 ${entry.protein}g`}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsEditOpen(true)}
          >
            <PencilIcon className="text-muted-foreground" />
            <span className="sr-only">수정</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleDelete}
            disabled={deleteEntry.isPending}
          >
            <Trash2Icon className="text-muted-foreground" />
            <span className="sr-only">삭제</span>
          </Button>
        </div>
        <span className="text-sm font-bold text-primary">{entry.calories}</span>
      </div>

      <FoodEditDrawer
        entry={entry}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}
