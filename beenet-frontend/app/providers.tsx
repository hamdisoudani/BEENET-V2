"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import React from "react";
import { useModelStore } from "@/stores/modelStore";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem 
        disableTransitionOnChange={false}
        storageKey="beenet-theme"
      >
        <StatusBootstrap />
        {children}
      </ThemeProvider>
    </ClerkProvider>
  );
}

function StatusBootstrap() {
  const { isLoaded, userId } = useAuth();
  const { setStatus, setStatusLoading, setStatusError } = useModelStore();
  
  React.useEffect(() => {
    if (!isLoaded || !userId) return;
    (async () => {
      try {
        setStatusLoading(true);
        setStatusError(false);
        const res = await fetch('/api/secrets/status', { 
          method: 'GET', 
          credentials: 'include', 
          cache: 'no-store' 
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) setStatus(Boolean(data?.hasModel), Boolean(data?.hasSerperKey));
        else setStatusError(true);
      } catch {}
      finally { setStatusLoading(false); }
    })();
  }, [isLoaded, userId, setStatus, setStatusLoading, setStatusError]);
  
  return null;
}

// Import useAuth inside the component to avoid SSR issues
import { useAuth } from "@clerk/nextjs";
