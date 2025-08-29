"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, { message: "닉네임은 2자 이상이어야 합니다." })
    .max(30, { message: "닉네임은 30자 이하여야 합니다." }),
  unit: z.enum(["kg", "lb"]),
  target_weight: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) =>
        v === undefined ||
        v === "" ||
        (!Number.isNaN(Number(v)) && Number(v) > 0 && Number(v) <= 500),
      { message: "0과 500 사이의 숫자를 입력하세요." },
    ),
});

type FormValues = z.infer<typeof schema>;

type ProfileFormProps = {
  userId: string;
  initial: {
    nickname: string;
    unit: "kg" | "lb";
    target_weight: number | null;
  };
};

export function ProfileForm({ userId, initial }: ProfileFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nickname: initial.nickname ?? "",
      unit: initial.unit ?? "kg",
      target_weight: initial.target_weight != null ? String(initial.target_weight) : "",
    },
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: FormValues) => {
    setSuccessMessage(null);
    startTransition(async () => {
      const supabase = createClient();
      const weightNum =
        values.target_weight && values.target_weight !== "" ? Number(values.target_weight) : null;
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        nickname: values.nickname,
        unit: values.unit,
        target_weight: weightNum,
      });

      if (error) {
        form.setError("nickname", { message: "저장 중 오류가 발생했습니다." });
        return;
      }

      setSuccessMessage("프로필이 저장되었습니다.");
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>닉네임</FormLabel>
              <FormControl>
                <Input placeholder="닉네임을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>단위</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="단위를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target_weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>목표 체중</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  placeholder="예: 70.0"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "저장 중..." : "저장"}
          </Button>
          {successMessage ? (
            <p className="text-sm text-muted-foreground">{successMessage}</p>
          ) : null}
        </div>
      </form>
    </Form>
  );
}

export default ProfileForm;
