import type { ReactNode } from "react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav";
import {
  MOBILE_BOTTOM_NAV_HEIGHT,
  MOBILE_HEADER_HEIGHT,
} from "@/components/mobile/constants";

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <MobileHeader />
      <main
        className="px-4"
        style={{
          paddingTop: `calc(${MOBILE_HEADER_HEIGHT}px + env(safe-area-inset-top))`,
          paddingBottom: `calc(${MOBILE_BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom) + 8px)`,
        }}
      >
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
