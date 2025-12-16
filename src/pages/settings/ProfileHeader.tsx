import * as React from "react";
import { useUser } from "@clerk/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLatestMetricByType } from "@/features/metrics/queries";
import { useSettings } from "@/features/settings/useSettings";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function toNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function toDateString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  // expected: YYYY-MM-DD (but tolerate anything Date can parse)
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) return undefined;
  return v.slice(0, 10);
}

function computeAge(birthdateYYYYMMDD: string): number | undefined {
  const d = new Date(birthdateYYYYMMDD);
  if (!Number.isFinite(d.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 ? age : undefined;
}

function formatWeightKg(kg: number, units: "metric" | "imperial") {
  if (units === "imperial") {
    const lb = kg * 2.2046226218;
    return { value: Number(lb.toFixed(1)), unit: "lb" as const };
  }
  return { value: Number(kg.toFixed(1)), unit: "kg" as const };
}

function formatHeightCm(cm: number, units: "metric" | "imperial") {
  if (units === "imperial") {
    const totalIn = cm / 2.54;
    const ft = Math.floor(totalIn / 12);
    const inches = Math.round(totalIn - ft * 12);
    return { label: `${ft}' ${inches}"` };
  }
  return { label: `${Math.round(cm)} cm` };
}

type ProfileUnsafeMetadata = {
  heightCm?: unknown;
  birthdate?: unknown; // YYYY-MM-DD
  plan?: unknown; // optional: allow "pro"
};

export function ProfileHeader() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { settings } = useSettings();
  const { data: latestWeight } = useLatestMetricByType("weight");

  const displayName =
    (isLoaded && isSignedIn && (user?.fullName || user?.firstName)) || "User";

  const imageUrl = isLoaded && isSignedIn ? user?.imageUrl : undefined;

  const unsafe = (user?.unsafeMetadata ?? {}) as ProfileUnsafeMetadata;
  const heightCm = toNumber(unsafe.heightCm);
  const birthdate = toDateString(unsafe.birthdate);
  const age = birthdate ? computeAge(birthdate) : undefined;

  const publicMeta = (user?.publicMetadata ?? {}) as Record<string, unknown>;
  const planRaw = (unsafe.plan ?? publicMeta.plan) as string | undefined;
  const planLabel =
    planRaw && String(planRaw).toLowerCase() === "pro"
      ? "Pro Member"
      : "Member";

  const displayedWeight =
    latestWeight?.value !== undefined
      ? formatWeightKg(latestWeight.value, settings.units)
      : undefined;

  const [isEditingVitals, setIsEditingVitals] = React.useState(false);
  const [form, setForm] = React.useState(() => ({
    heightCm: heightCm !== undefined ? String(heightCm) : "",
    birthdate: birthdate ?? "",
  }));
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // keep form in sync when user metadata changes (or after save)
    setForm({
      heightCm: heightCm !== undefined ? String(heightCm) : "",
      birthdate: birthdate ?? "",
    });
  }, [heightCm, birthdate]);

  const saveVitals = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const nextHeightCm =
        form.heightCm.trim() === "" ? undefined : Number(form.heightCm.trim());
      if (
        nextHeightCm !== undefined &&
        (!Number.isFinite(nextHeightCm) || nextHeightCm <= 0)
      ) {
        setSaveError("Height must be a valid number.");
        return;
      }

      const nextBirthdate = form.birthdate.trim() || undefined;
      if (nextBirthdate) {
        const d = new Date(nextBirthdate);
        if (!Number.isFinite(d.getTime())) {
          setSaveError("Birthdate must be a valid date.");
          return;
        }
      }

      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata as Record<string, unknown>),
          heightCm: nextHeightCm,
          birthdate: nextBirthdate,
        },
      });

      setIsEditingVitals(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

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
            {planLabel}
          </span>
        </div>

        <div className="grid w-full grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">
              Weight
            </p>
            <p className="text-base font-bold">
              {displayedWeight
                ? `${displayedWeight.value} ${displayedWeight.unit}`
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">
              Height
            </p>
            <p className="text-base font-bold">
              {heightCm !== undefined
                ? formatHeightCm(heightCm, settings.units).label
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">Age</p>
            <p className="text-base font-bold">
              {age !== undefined ? age : "—"}
            </p>
          </div>
        </div>

        <div className="grid w-full gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsEditingVitals((v) => !v)}
            >
              {isEditingVitals ? "Cancel" : "Edit Height / Age"}
            </Button>
            <Button
              onClick={() => {
                const el = document.getElementById("clerk-profile");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Edit Account Details
            </Button>
          </div>

          {isEditingVitals && (
            <div className="w-full space-y-3 rounded-xl border bg-card p-3">
              <Field>
                <FieldLabel htmlFor="profileHeightCm">Height (cm)</FieldLabel>
                <Input
                  id="profileHeightCm"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 180"
                  value={form.heightCm}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, heightCm: e.target.value }))
                  }
                  disabled={isSaving}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="profileBirthdate">
                  Birthdate (YYYY-MM-DD)
                </FieldLabel>
                <Input
                  id="profileBirthdate"
                  type="date"
                  value={form.birthdate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, birthdate: e.target.value }))
                  }
                  disabled={isSaving}
                />
              </Field>

              {saveError && (
                <p className="text-xs font-medium text-destructive">
                  {saveError}
                </p>
              )}

              <Button
                className="w-full"
                onClick={saveVitals}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Saved to Clerk{" "}
                <span className="font-medium">unsafeMetadata</span> (heightCm,
                birthdate).
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
