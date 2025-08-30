"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Constants } from "../../../../../database.types";

const schema = z.object({
  name: z.string().trim().min(2, { message: "2자 이상 입력" }),
  slug: z
    .string()
    .trim()
    .min(2, { message: "2자 이상 입력" })
    .regex(/^[a-z0-9-]+$/, { message: "소문자/숫자/하이픈만" }),
  difficulty: z.enum(
    Constants.public.Enums.difficulty_level as unknown as ["beginner", "intermediate", "advanced"],
  ),
  mechanic: z.enum(Constants.public.Enums.mechanic_type as unknown as ["compound", "isolation"]),
  plane: z.enum(
    Constants.public.Enums.plane_of_motion as unknown as [
      "sagittal",
      "frontal",
      "transverse",
      "multi",
    ],
  ),
  unilateral: z.boolean().default(false),
  visibility: z.enum(
    Constants.public.Enums.exercise_visibility as unknown as ["public", "private"],
  ),
  description: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ExerciseForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      difficulty: "beginner",
      mechanic: "compound",
      plane: "sagittal",
      unilateral: false,
      visibility: "public",
      description: "",
    },
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setMessage(null);
    setSaving(true);
    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        setMessage("로그인이 필요합니다");
        return;
      }

      const { error } = await supabase.from("exercises").insert({
        name: values.name,
        slug: values.slug,
        difficulty: values.difficulty,
        mechanic: values.mechanic,
        plane: values.plane,
        unilateral: values.unilateral,
        visibility: values.visibility,
        description: values.description ?? null,
        created_by: user.id,
      });

      if (error) {
        setMessage("저장 중 오류가 발생했습니다");
        return;
      }

      form.reset();
      setMessage("운동이 추가되었습니다");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>운동명</FormLabel>
              <FormControl>
                <Input placeholder="예: 스쿼트" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>슬러그</FormLabel>
              <FormControl>
                <Input placeholder="예: squat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>난이도</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="난이도 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">beginner</SelectItem>
                      <SelectItem value="intermediate">intermediate</SelectItem>
                      <SelectItem value="advanced">advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mechanic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>메카닉</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="메카닉 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compound">compound</SelectItem>
                      <SelectItem value="isolation">isolation</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="plane"
            render={({ field }) => (
              <FormItem>
                <FormLabel>운동면</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="운동면 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sagittal">sagittal</SelectItem>
                      <SelectItem value="frontal">frontal</SelectItem>
                      <SelectItem value="transverse">transverse</SelectItem>
                      <SelectItem value="multi">multi</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>공개 여부</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="공개 여부" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">public</SelectItem>
                      <SelectItem value="private">private</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="unilateral"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormLabel>편측 운동</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="운동 설명을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "저장 중..." : "운동 추가"}
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </form>
    </Form>
  );
}
