"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
  refetchInterval?: number;
}

export function SessionProvider({ 
  children,
  refetchInterval = 0 // Default to 0 (no auto-refresh)
}: SessionProviderProps) {
  return (
    <NextAuthSessionProvider 
      refetchInterval={refetchInterval}
      refetchOnWindowFocus={true} // Refresh when window gets focus
    >
      {children}
    </NextAuthSessionProvider>
  );
} 