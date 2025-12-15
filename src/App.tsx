import { ComponentExample } from "@/components/component-example";
import { ReloadPrompt } from "@/components/pwa/ReloadPrompt";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

export function App() {
  return (
    <>
      <ReloadPrompt />
      <header style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      <ComponentExample />
    </>
  );
}

export default App;
