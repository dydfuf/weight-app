import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Mobile/PWA-friendly defaults: avoid aggressive refetching.
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
      staleTime: 30_000,
    },
  },
});
