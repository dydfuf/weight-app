import type { ReactNode } from "react";
import {
  MobileHeader,
  MOBILE_HEADER_HEIGHT,
} from "@/components/mobile/mobile-header";
import {
  MobileBottomNav,
  MOBILE_BOTTOM_NAV_HEIGHT,
} from "@/components/mobile/mobile-bottom-nav";

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <MobileHeader />
      <main
        className="px-4"
        style={{
          paddingTop: `calc(${MOBILE_HEADER_HEIGHT}px + env(safe-area-inset-top) + 8px)`,
          paddingBottom: `calc(${MOBILE_BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom) + 8px)`,
        }}
      >
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
