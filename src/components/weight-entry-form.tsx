"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Scale } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const weightFormSchema = z.object({
  weight: z
    .number({
      message: "올바른 숫자를 입력해주세요",
    })
    .min(0.1, "체중은 0.1kg 이상이어야 합니다")
    .max(499.99, "체중은 500kg 미만이어야 합니다"),
  unit: z.enum(["kg", "lb"], {
    message: "단위를 선택해주세요",
  }),
  note: z.string().max(500, "메모는 500자 이내로 입력해주세요").optional(),
});

type WeightFormData = z.infer<typeof weightFormSchema>;

interface WeightEntryFormProps {
  onSuccess?: (weightData: { weight_kg: number; recorded_at: string; note?: string }) => void;
  className?: string;
}

export function WeightEntryForm({ onSuccess, className }: WeightEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<WeightFormData>({
    resolver: zodResolver(weightFormSchema),
    defaultValues: {
      weight: undefined,
      unit: "kg",
      note: "",
    },
  });

  const watchedUnit = watch("unit");
  const supabase = createClient();

  // kg ↔ lb 변환 함수들
  const kgToLb = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;
  const lbToKg = (lb: number) => Math.round(lb * 0.453592 * 10) / 10;

  const onSubmit = async (data: WeightFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 단위 변환: kg로 저장
      const weightKg = data.unit === "lb" ? lbToKg(data.weight) : data.weight;

      // 오늘 날짜의 체중이 이미 있는지 확인
      const today = new Date().toISOString().split("T")[0];
      const { data: existingEntry, error: fetchError } = await supabase
        .from("weights")
        .select("id")
        .eq("recorded_at", today)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 = no rows found
        throw fetchError;
      }

      if (existingEntry) {
        // 기존 엔트리가 있으면 업데이트
        const { error: updateError } = await supabase
          .from("weights")
          .update({
            weight_kg: weightKg,
            note: data.note || null,
          })
          .eq("recorded_at", today);

        if (updateError) {
          throw updateError;
        }
      } else {
        // 새 엔트리 생성
        const { error: insertError } = await supabase.from("weights").insert({
          recorded_at: today,
          weight_kg: weightKg,
          note: data.note || null,
        });

        if (insertError) {
          throw insertError;
        }
      }

      toast.success(
        existingEntry ? "오늘의 체중이 업데이트되었습니다" : "오늘의 체중이 기록되었습니다",
      );

      // 성공 데이터 전달 (낙관적 업데이트용)
      const successData = {
        weight_kg: weightKg,
        recorded_at: today,
        note: data.note,
      };

      // 폼 초기화
      reset();
      onSuccess?.(successData);
    } catch (err) {
      console.error("체중 기록 실패:", err);
      setError(err instanceof Error ? err.message : "체중 기록 중 오류가 발생했습니다");
      toast.error("체중 기록에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWeightChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!Number.isNaN(numValue)) {
      setValue("weight", numValue, { shouldValidate: true });
    }
  };

  const handleUnitChange = (newUnit: "kg" | "lb") => {
    const currentWeight = watch("weight");
    if (currentWeight && !Number.isNaN(currentWeight)) {
      // 단위 변환
      const convertedWeight = newUnit === "lb" ? kgToLb(currentWeight) : lbToKg(currentWeight);
      setValue("weight", convertedWeight, { shouldValidate: true });
    }
    setValue("unit", newUnit);
  };

  // 현재 입력된 체중을 표시용으로 변환
  const displayWeight = watch("weight");
  const displayValue =
    displayWeight && !Number.isNaN(displayWeight)
      ? watchedUnit === "kg"
        ? displayWeight
        : kgToLb(displayWeight)
      : undefined;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="h-5 w-5" />
          오늘의 체중 기록
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="weight">체중 *</Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                max={watchedUnit === "kg" ? "499.99" : "1099.99"}
                placeholder={`체중을 입력하세요 (${watchedUnit})`}
                {...register("weight", {
                  valueAsNumber: true,
                  onChange: (e) => handleWeightChange(e.target.value),
                })}
                className="flex-1"
              />
              <Select value={watchedUnit} onValueChange={handleUnitChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {displayValue && (
              <p className="text-sm text-muted-foreground">
                {watchedUnit === "kg"
                  ? `${displayValue} kg = ${kgToLb(displayValue)} lb`
                  : `${displayValue} lb = ${lbToKg(displayValue)} kg`}
              </p>
            )}
            {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">메모 (선택사항)</Label>
            <Textarea
              id="note"
              placeholder="오늘의 체중에 대한 메모를 남겨보세요"
              {...register("note")}
              className="resize-none"
              rows={3}
            />
            {errors.note && <p className="text-sm text-destructive">{errors.note.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "저장 중..." : "체중 기록하기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
