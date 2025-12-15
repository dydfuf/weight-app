import { SignedIn, SignedOut } from "@clerk/react-router";
import { Link } from "react-router";

export function LandingPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">weight app</h1>
      <p className="text-sm text-muted-foreground">
        Sign in to access the app area.
      </p>

      <SignedOut>
        <div className="flex gap-3">
          <Link className="underline" to="/sign-in">
            Go to sign in
          </Link>
          <Link className="underline" to="/sign-up">
            Create an account
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <Link className="underline" to="/app">
          Go to app
        </Link>
      </SignedIn>
    </div>
  );
}
