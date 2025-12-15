import { Outlet } from "react-router";

import { BottomTabBar } from "@/components/navigation/BottomTabBar";

export function AppShellLayout() {
  return (
    <div className="min-h-dvh">
      <main className="pb-[calc(56px+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
}
