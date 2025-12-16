import * as React from "react";

export type Units = "metric" | "imperial";

export interface AppSettings {
  units: Units;
  workoutReminders: boolean;
}

const STORAGE_KEY = "weight-app:settings";

const DEFAULT_SETTINGS: AppSettings = {
  units: "metric",
  workoutReminders: false,
};

function readSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings> | null;
    return {
      units: parsed?.units === "imperial" ? "imperial" : "metric",
      workoutReminders: Boolean(parsed?.workoutReminders),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(next: AppSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  } catch {
    // ignore (quota, privacy mode, etc.)
  }
}

/**
 * App preferences stored in localStorage (MVP).
 * Uses the storage event to stay in sync across tabs.
 */
export function useSettings() {
  const [settings, setSettings] = React.useState<AppSettings>(() =>
    readSettings()
  );

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setSettings(readSettings());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = React.useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next: AppSettings = { ...prev, ...patch };
      writeSettings(next);
      return next;
    });
  }, []);

  return {
    settings,
    setUnits: (units: Units) => update({ units }),
    setWorkoutReminders: (workoutReminders: boolean) =>
      update({ workoutReminders }),
    toggleWorkoutReminders: () =>
      update({ workoutReminders: !settings.workoutReminders }),
  } as const;
}
