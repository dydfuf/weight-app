"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function seedSampleExercises() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다");
  }

  const samples = [
    {
      name: "스쿼트",
      slug: `squat-${Math.random().toString(36).slice(2, 7)}`,
      difficulty: "beginner",
      mechanic: "compound",
      plane: "sagittal",
      unilateral: false,
      description: "하체 전반을 강화하는 대표적인 복합 운동",
      created_by: user.id,
      visibility: "public",
    },
    {
      name: "벤치 프레스",
      slug: `bench-press-${Math.random().toString(36).slice(2, 7)}`,
      difficulty: "intermediate",
      mechanic: "compound",
      plane: "transverse",
      unilateral: false,
      description: "가슴 중심의 상체 복합 운동",
      created_by: user.id,
      visibility: "public",
    },
    {
      name: "덤벨 컬",
      slug: `dumbbell-curl-${Math.random().toString(36).slice(2, 7)}`,
      difficulty: "beginner",
      mechanic: "isolation",
      plane: "sagittal",
      unilateral: true,
      description: "이두근에 집중하는 고립 운동",
      created_by: user.id,
      visibility: "public",
    },
  ] as const;

  const { error } = await supabase.from("exercises").insert(samples as never);
  if (error) throw error;

  revalidatePath("/workout");
}
