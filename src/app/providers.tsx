"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "thirdweb/react";
import { useAuthListener } from "@/hooks/use-auth";

function AuthSync({ children }: { children: React.ReactNode }) {
  useAuthListener();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <AuthSync>{children}</AuthSync>
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}
