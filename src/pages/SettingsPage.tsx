import { UserProfile } from "@clerk/react-router";

export function SettingsPage() {
  return (
    <div className="flex justify-center">
      <UserProfile path="/app/settings" />
    </div>
  );
}
