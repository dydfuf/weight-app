import { CaloriesHeroCard } from "./CaloriesHeroCard";
import { DashboardHeader } from "./DashboardHeader";
import { MacroProgressCards } from "./MacroProgressCards";
import { QuickActions } from "./QuickActions";
import { WeightTrendCard } from "./WeightTrendCard";
import { WorkoutWeekCard } from "./WorkoutWeekCard";

export function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4 p-4">
      <DashboardHeader />
      <CaloriesHeroCard />
      <QuickActions />
      <MacroProgressCards />
      <WeightTrendCard />
      <WorkoutWeekCard />
    </div>
  );
}
