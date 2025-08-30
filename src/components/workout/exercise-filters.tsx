"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
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
import { cn } from "@/lib/utils";
import { Constants } from "../../../database.types";

type FilterKey = "q" | "difficulty" | "mechanic" | "plane" | "unilateral";

function setParams(
  current: URLSearchParams,
  updates: Partial<Record<FilterKey, string | undefined>>,
) {
  const next = new URLSearchParams(current.toString());
  (Object.keys(updates) as FilterKey[]).forEach((key) => {
    const value = updates[key];
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, value);
  });
  return next;
}

export function ExerciseFilters({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localQ, setLocalQ] = useState("");
  const [localDifficulty, setLocalDifficulty] = useState("");
  const [localMechanic, setLocalMechanic] = useState("");
  const [localPlane, setLocalPlane] = useState("");
  const [localUnilateral, setLocalUnilateral] = useState("");

  const values = useMemo(() => {
    return {
      q: searchParams.get("q") ?? "",
      difficulty: searchParams.get("difficulty") ?? "",
      mechanic: searchParams.get("mechanic") ?? "",
      plane: searchParams.get("plane") ?? "",
      unilateral: searchParams.get("unilateral") ?? "",
    } as Record<FilterKey, string>;
  }, [searchParams]);

  function update(updates: Partial<Record<FilterKey, string | undefined>>) {
    const next = setParams(searchParams, updates);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  }

  function clearAll() {
    setLocalQ("");
    setLocalDifficulty("");
    setLocalMechanic("");
    setLocalPlane("");
    setLocalUnilateral("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  // Sync local input state with URL q on mount and when external changes happen
  useEffect(() => {
    setLocalQ(values.q);
    setLocalDifficulty(values.difficulty);
    setLocalMechanic(values.mechanic);
    setLocalPlane(values.plane);
    setLocalUnilateral(values.unilateral);
  }, [values.q, values.difficulty, values.mechanic, values.plane, values.unilateral]);

  function commitAll() {
    update({
      q: localQ || undefined,
      difficulty: localDifficulty || undefined,
      mechanic: localMechanic || undefined,
      plane: localPlane || undefined,
      unilateral: localUnilateral || undefined,
    });
  }

  return (
    <Card className={cn("border-input/60", className)}>
      <CardHeader>
        <CardTitle className="text-base">운동 검색 및 필터</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="운동 이름 검색"
            className="pl-8"
            value={localQ}
            onChange={(e) => setLocalQ(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitAll();
              }
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={localDifficulty || undefined} onValueChange={setLocalDifficulty}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="난이도" />
            </SelectTrigger>
            <SelectContent>
              {Constants.public.Enums.difficulty_level.map((lv) => (
                <SelectItem key={lv} value={lv}>
                  {lv}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={localMechanic || undefined} onValueChange={setLocalMechanic}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="메커니즘" />
            </SelectTrigger>
            <SelectContent>
              {Constants.public.Enums.mechanic_type.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={localPlane || undefined} onValueChange={setLocalPlane}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="운동면" />
            </SelectTrigger>
            <SelectContent>
              {Constants.public.Enums.plane_of_motion.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={localUnilateral || undefined} onValueChange={setLocalUnilateral}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="단측/양측" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">단측</SelectItem>
              <SelectItem value="false">양측</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={commitAll} disabled={isPending}>
            검색
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} disabled={isPending}>
            필터 초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ExerciseFilters;
