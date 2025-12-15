import { SignedIn, SignedOut, UserButton } from "@clerk/react-router";
import { Link, Outlet } from "react-router";

import { ReloadPrompt } from "@/components/pwa/ReloadPrompt";

export function RootLayout() {
  return (
    <>
      <ReloadPrompt />
      <header className="flex items-center gap-3 p-3">
        <Link className="font-semibold" to="/">
          weight-app
        </Link>

        <nav className="flex items-center gap-3">
          <Link to="/">Home</Link>
          <Link to="/app">App</Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <SignedOut>
            <Link to="/sign-in">Sign in</Link>
            <Link to="/sign-up">Sign up</Link>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main className="p-3">
        <Outlet />
      </main>
    </>
  );
}
