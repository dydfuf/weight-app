import { Link } from "react-router";
import { Dumbbell, Scale, Utensils } from "lucide-react";

const actions = [
  {
    to: "/app/meals?add=1",
    icon: Utensils,
    label: "음식 추가",
  },
  {
    to: "/app/workouts?add=1",
    icon: Dumbbell,
    label: "운동 기록",
  },
  {
    to: "/app/progress?add=1&type=weight",
    icon: Scale,
    label: "체중 입력",
  },
] as const;

export function QuickActions() {
  return (
    <section className="grid grid-cols-3 gap-3">
      {actions.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className="group flex flex-col items-center justify-center gap-2 rounded-xl border bg-card p-3 shadow-sm transition-all active:scale-95"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <action.icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {action.label}
          </span>
        </Link>
      ))}
    </section>
  );
}
