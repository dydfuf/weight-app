import { Navigate, Route, Routes } from "react-router";

import { AppShellLayout } from "@/layouts/AppShellLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { RequireAuth } from "@/layouts/RequireAuth";
import { RootLayout } from "@/layouts/RootLayout";
import { DashboardPage } from "@/pages/dashboard";
import { LandingPage } from "@/pages/LandingPage";
import { MealsPage } from "@/pages/MealsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProgressPage } from "@/pages/ProgressPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { WorkoutsPage } from "@/pages/WorkoutsPage";

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="sign-in/*" element={<SignInPage />} />
          <Route path="sign-up/*" element={<SignUpPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="app" element={<AppShellLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="meals" element={<MealsPage />} />
            <Route path="workouts" element={<WorkoutsPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="settings/*" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
