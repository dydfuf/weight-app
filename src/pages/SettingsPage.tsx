import { UserProfile } from "@clerk/react-router";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

import { AccountSection } from "./settings/AccountSection";
import { GoalsSection } from "./settings/GoalsSection";
import { PreferencesSection } from "./settings/PreferencesSection";
import { ProfileHeaderPlaceholder } from "./settings/ProfileHeaderPlaceholder";
import { StatsCards } from "./settings/StatsCards";

export function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-md space-y-4 p-4">
      {/* TopAppBar */}
      <div className="sticky top-0 z-40 -mx-4 flex items-center justify-between border-b bg-background/95 px-4 py-2 backdrop-blur">
        <div className="w-10">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
          </Button>
        </div>
        <h1 className="flex-1 text-center text-base font-bold">Profile</h1>
        <div className="w-10 flex justify-end">
          <Button type="button" variant="ghost" size="icon" aria-label="More">
            <MoreVertical />
          </Button>
        </div>
      </div>

      <ProfileHeaderPlaceholder />
      <StatsCards />
      <GoalsSection />
      <PreferencesSection />
      <AccountSection />

      <div id="clerk-profile" className="flex justify-center pt-2">
        <UserProfile path="/app/settings" />
      </div>
    </div>
  );
}
