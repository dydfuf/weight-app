import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/react-router";
import { Outlet } from "react-router";

export function RequireAuth() {
  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
