import Link from "next/link";
import ProfileForm from "@/components/profile-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="space-y-4 py-4">
        <h1 className="text-xl font-semibold">프로필</h1>
        <p className="text-sm text-muted-foreground">내 계정과 설정을 관리하세요.</p>

        <Card>
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/auth/login">로그인</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, unit, target_weight")
    .eq("id", user.id)
    .maybeSingle();

  const initial = {
    nickname: profile?.nickname ?? user.email?.split("@")[0] ?? "사용자",
    unit: (profile?.unit as "kg" | "lb") ?? "kg",
    target_weight: profile?.target_weight ?? null,
  } as const;

  return (
    <section className="space-y-4 py-4">
      <h1 className="text-xl font-semibold">프로필</h1>
      <p className="text-sm text-muted-foreground">내 계정과 설정을 관리하세요.</p>

      <Card>
        <CardHeader>
          <CardTitle>프로필 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm userId={user.id} initial={initial} />
        </CardContent>
      </Card>
    </section>
  );
}
