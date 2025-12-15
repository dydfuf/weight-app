import { Route, Routes } from "react-router";

import { RequireAuth } from "@/layouts/RequireAuth";
import { RootLayout } from "@/layouts/RootLayout";
import { AppHomePage } from "@/pages/AppHomePage";
import { LandingPage } from "@/pages/LandingPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="sign-in/*" element={<SignInPage />} />
        <Route path="sign-up/*" element={<SignUpPage />} />

        <Route element={<RequireAuth />}>
          <Route path="app/*" element={<AppHomePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
