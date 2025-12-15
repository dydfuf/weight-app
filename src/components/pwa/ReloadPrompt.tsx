import { useRegisterSW } from "virtual:pwa-register/react";

import { Button } from "@/components/ui/button";

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error("SW registration error", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[min(92vw,420px)] border bg-background shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-3">
        <div className="min-w-0 flex-1 text-sm">
          {offlineReady ? (
            <p className="text-foreground">App ready to work offline.</p>
          ) : (
            <p className="text-foreground">
              New content available. Reload to update.
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {needRefresh && (
            <Button
              size="sm"
              onClick={() => {
                void updateServiceWorker(true);
              }}
            >
              Reload
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={close}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
