import { useState } from "react";
import { useSearchParams } from "react-router";
import { Dumbbell, PlusIcon } from "lucide-react";

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
  isEmpty?: boolean;
}

export function AddExerciseDrawer({
  date,
  isEmpty = false,
}: AddExerciseDrawerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(() => searchParams.get("add") === "1");
  const [exerciseName, setExerciseName] = useState("");

  const addExercise = useAddWorkoutExercise();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Remove add param when closing
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("add");
      setSearchParams(newParams, { replace: true });
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
      <DrawerTrigger asChild>
        {isEmpty ? (
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
        ) : (
          <Button type="button" className="w-full">
            <PlusIcon className="mr-1 h-4 w-4" />
            운동 추가
          </Button>
        )}
      </DrawerTrigger>
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
