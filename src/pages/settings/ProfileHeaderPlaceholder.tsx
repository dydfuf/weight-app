import { useUser } from "@clerk/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export function ProfileHeaderPlaceholder() {
  const { isLoaded, isSignedIn, user } = useUser();

  const displayName =
    (isLoaded && isSignedIn && (user?.fullName || user?.firstName)) || "User";

  const imageUrl = isLoaded && isSignedIn ? user?.imageUrl : undefined;

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div
            className={cn(
              "grid size-24 place-items-center overflow-hidden rounded-full bg-muted text-lg font-semibold text-muted-foreground ring-4 ring-primary/15"
            )}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{getInitials(displayName)}</span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground">
            <span className="text-xs font-bold">✎</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-xl font-bold leading-tight">{displayName}</p>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Pro Member
          </span>
        </div>

        <div className="grid w-full grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">
              Weight
            </p>
            <p className="text-base font-bold">82 kg</p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">
              Height
            </p>
            <p className="text-base font-bold">180 cm</p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">Age</p>
            <p className="text-base font-bold">28</p>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => {
            const el = document.getElementById("clerk-profile");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          Edit Profile Details
        </Button>
      </div>
    </Card>
  );
}
