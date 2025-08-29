"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";
import { MOBILE_HEADER_HEIGHT } from "./constants";

export function MobileHeader() {
  const pathname = usePathname();

  const title = React.useMemo(() => {
    if (!pathname) return "웨잇";
    if (pathname.startsWith("/dashboard")) return "대시보드";
    if (pathname.startsWith("/workout")) return "운동";
    if (pathname.startsWith("/stats")) return "통계";
    if (pathname.startsWith("/profile")) return "프로필";
    if (pathname.startsWith("/settings")) return "설정";
    return "웨잇";
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)]",
      )}
      style={{ height: MOBILE_HEADER_HEIGHT }}
    >
      <div className="mx-auto flex h-full max-w-md items-center justify-between px-4">
        <Link href="/dashboard" className="font-semibold">
          {title}
        </Link>
      </div>
    </header>
  );
}
