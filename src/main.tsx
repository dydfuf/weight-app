import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ClerkProvider } from "@clerk/react-router";
import { QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./lib/queryClient";
import { seedExercisesIfEmpty } from "./data/seed/seedExercises";

// Seed exercises database on app startup
seedExercisesIfEmpty().catch(console.error);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        signInFallbackRedirectUrl="/app"
        signUpFallbackRedirectUrl="/app"
        afterSignOutUrl="/"
      >
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
);
