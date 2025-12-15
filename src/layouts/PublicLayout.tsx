import { SignedIn, SignedOut, UserButton } from "@clerk/react-router";
import { Link, Outlet } from "react-router";

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 p-4">
        <Link className="font-semibold" to="/">
          weight-app
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <SignedOut>
            <Link className="text-sm underline" to="/sign-in">
              Sign in
            </Link>
            <Link className="text-sm underline" to="/sign-up">
              Sign up
            </Link>
          </SignedOut>
          <SignedIn>
            <Link className="text-sm underline" to="/app">
              Open app
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
