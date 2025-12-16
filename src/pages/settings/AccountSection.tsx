import { useClerk } from "@clerk/react-router";
import { ChevronRight, CreditCard, LogOut } from "lucide-react";

import { Card } from "@/components/ui/card";

const APP_VERSION = "0.0.0";

export function AccountSection() {
  const clerk = useClerk();

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-base font-bold">Account</h2>

      <Card className="divide-y">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-muted">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium">Subscription</p>
          </div>
          <ChevronRight
            className="h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={() => clerk.signOut({ redirectUrl: "/" })}
          className="flex w-full items-center gap-3 p-4 text-left text-destructive hover:bg-destructive/10"
        >
          <div className="grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium">Log Out</p>
        </button>
      </Card>

      <p className="text-center text-xs font-medium text-muted-foreground">
        Version {APP_VERSION}
      </p>
    </section>
  );
}
