import { ChevronRight, Link2, Ruler, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useSettings } from "@/features/settings/useSettings";

export function PreferencesSection() {
  const { settings, setUnits, toggleWorkoutReminders } = useSettings();

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-base font-bold">Preferences</h2>

      <Card className="divide-y">
        {/* Units */}
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-muted">
              <Ruler className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium">Units</p>
          </div>

          <div className="flex rounded-md bg-muted p-1">
            <Button
              type="button"
              size="xs"
              variant={settings.units === "metric" ? "secondary" : "ghost"}
              className="h-7"
              onClick={() => setUnits("metric")}
            >
              Metric
            </Button>
            <Button
              type="button"
              size="xs"
              variant={settings.units === "imperial" ? "secondary" : "ghost"}
              className="h-7"
              onClick={() => setUnits("imperial")}
            >
              Imperial
            </Button>
          </div>
        </div>

        {/* Workout reminders */}
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-muted">
              <Bell className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium">Workout Reminders</p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.workoutReminders}
            onClick={toggleWorkoutReminders}
            className={cn(
              "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors",
              settings.workoutReminders
                ? "border-primary bg-primary"
                : "border-input bg-muted"
            )}
          >
            <span
              className={cn(
                "inline-block size-5 translate-x-1 rounded-full bg-background shadow transition-transform",
                settings.workoutReminders && "translate-x-6"
              )}
            />
          </button>
        </div>

        {/* Integrations */}
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-muted/40"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-muted">
              <Link2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium">Integrations</p>
              <p className="text-xs text-muted-foreground">
                Apple Health, Fitbit
              </p>
            </div>
          </div>
          <ChevronRight
            className="h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
        </button>
      </Card>
    </section>
  );
}
