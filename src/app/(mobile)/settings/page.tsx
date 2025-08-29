import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("nickname, unit, target_weight")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <section className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">설정</h1>
        <ThemeToggle />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>유저 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {user ? (
            <div className="space-y-1">
              <p>
                <span className="text-muted-foreground">이메일:</span> {user.email}
              </p>
              <p className="break-all">
                <span className="text-muted-foreground">UID:</span> {user.id}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="text-muted-foreground">닉네임:</span> {profile?.nickname ?? "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">단위:</span> {profile?.unit ?? "kg"}
                </p>
                <p>
                  <span className="text-muted-foreground">목표 체중:</span>{" "}
                  {profile?.target_weight ?? "-"}
                </p>
              </div>
              <div className="pt-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/profile">프로필 설정</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">로그인이 필요합니다.</p>
              <Button asChild>
                <Link href="/auth/login">로그인</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">{user ? <LogoutButton /> : null}</div>
    </section>
  );
}
