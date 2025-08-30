import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
    <section className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">설정</h1>
      </div>

      {user ? (
        <>
          <div className="rounded-lg border divide-y">
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground">이메일</p>
              <p className="break-all text-lg font-medium">{user.email}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground">닉네임</p>
              <p className="text-lg font-medium">{profile?.nickname ?? "-"}</p>
            </div>
          </div>

          <Accordion type="single" collapsible className="rounded-lg border">
            <AccordionItem value="details">
              <AccordionTrigger className="px-4">추가 정보</AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="divide-y">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">단위</span>
                    <span>{profile?.unit ?? "kg"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">목표 체중</span>
                    <span>{profile?.target_weight ?? "-"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">UID</span>
                    <span className="break-all">{user.id}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="rounded-lg border divide-y">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm">테마</span>
              <ThemeToggle />
            </div>
            <Link href="/profile" className="flex items-center justify-between px-4 py-3">
              <span className="text-sm">프로필 설정</span>
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            </Link>
          </div>

          <div className="flex gap-2">{user ? <LogoutButton /> : null}</div>
        </>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">로그인이 필요합니다.</p>
          <Button asChild>
            <Link href="/auth/login">로그인</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
