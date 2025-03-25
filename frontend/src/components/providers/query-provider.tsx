"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

export function QueryProvider({ children }: React.PropsWithChildren) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Global default options for all React Query instances
            staleTime: 60 * 1000, // Data is fresh for 1 minute
            retry: 1, // Only retry failed queries once
            refetchOnWindowFocus: false, // Disable automatic refetching when window is focused
            gcTime: 5 * 60 * 1000, // 5 minutes before inactive data is garbage collected
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
