"use client";

import { BarChart3, Dumbbell, Home, Settings as SettingsIcon, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { MOBILE_BOTTOM_NAV_HEIGHT } from "./constants";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "홈", href: "/dashboard", icon: Home },
  { label: "운동", href: "/workout", icon: Dumbbell },
  { label: "통계", href: "/stats", icon: BarChart3 },
  { label: "프로필", href: "/profile", icon: User },
  { label: "설정", href: "/settings", icon: SettingsIcon },
];

export function MobileBottomNav() {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();

  // Warm up route cache for primary tabs
  useEffect(() => {
    try {
      NAV_ITEMS.forEach(({ href }) => {
        router.prefetch?.(href);
      });
    } catch {
      // no-op
    }
  }, [router]);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      )}
      aria-label="Bottom navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 pt-1 mb-4"
        style={{ height: MOBILE_BOTTOM_NAV_HEIGHT }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              prefetch
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex flex-col items-center justify-center rounded-md px-3 py-2 text-xs font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "mb-1 h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
