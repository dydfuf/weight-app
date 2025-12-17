import { PlusIcon } from "lucide-react";

interface FABProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

export function FAB({ onClick, label, icon }: FABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] right-4 z-40 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95"
      aria-label={label}
    >
      {icon ?? <PlusIcon className="size-6" />}
    </button>
  );
}
