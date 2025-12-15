import { NavLink } from "react-router";
import { Dumbbell, Home, Settings, TrendingUp, Utensils } from "lucide-react";

const tabs = [
  { to: "/app/dashboard", icon: Home, label: "홈" },
  { to: "/app/meals", icon: Utensils, label: "식단" },
  { to: "/app/workouts", icon: Dumbbell, label: "운동" },
  { to: "/app/progress", icon: TrendingUp, label: "변화" },
  { to: "/app/settings", icon: Settings, label: "설정" },
] as const;

export function BottomTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom navigation"
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              [
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-xs",
                isActive ? "text-foreground" : "text-muted-foreground",
              ].join(" ")
            }
          >
            <tab.icon className="h-5 w-5" aria-hidden="true" />
            <span className="truncate">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
