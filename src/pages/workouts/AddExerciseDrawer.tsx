import { useState } from "react";
import { Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAddWorkoutExercise } from "@/features/workouts/mutations";

interface AddExerciseDrawerProps {
  date: string;
  /** Show empty state trigger when true (for inline empty state button) */
  showEmptyTrigger?: boolean;
  /** Controlled mode: open state */
  open?: boolean;
  /** Controlled mode: callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

export function AddExerciseDrawer({
  date,
  showEmptyTrigger = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddExerciseDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");

  const addExercise = useAddWorkoutExercise();

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (value: boolean) => controlledOnOpenChange?.(value)
    : setInternalOpen;

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setExerciseName("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    addExercise.mutate(
      { date, name: exerciseName.trim() },
      {
        onSuccess: () => {
          setExerciseName("");
          setOpen(false);
        },
      }
    );
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      {/* Only show trigger for empty state inline button */}
      {showEmptyTrigger && (
        <DrawerTrigger asChild>
          <button
            type="button"
            className="group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 p-6 text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-medium">
                기록된 운동이 없습니다
              </span>
              <span className="text-xs font-semibold text-primary">
                운동 추가하기
              </span>
            </div>
          </button>
        </DrawerTrigger>
      )}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>운동 추가</DrawerTitle>
          <DrawerDescription>수행할 운동 종목을 입력하세요.</DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="px-4">
          <Field>
            <FieldLabel htmlFor="exerciseName">종목명</FieldLabel>
            <Input
              id="exerciseName"
              type="text"
              placeholder="예: 벤치프레스, 스쿼트, 데드리프트"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              autoFocus
              required
            />
          </Field>
        </form>
        <DrawerFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={addExercise.isPending || !exerciseName.trim()}
          >
            {addExercise.isPending ? "추가 중..." : "추가"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">취소</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
