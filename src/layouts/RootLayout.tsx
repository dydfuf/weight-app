import { Outlet } from "react-router";

import { ReloadPrompt } from "@/components/pwa/ReloadPrompt";

export function RootLayout() {
  return (
    <>
      <ReloadPrompt />
      <Outlet />
    </>
  );
}
