"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ToastProvider() {
  const { theme } = useTheme();
  
  return (
    <Toaster
      position="top-right"
      richColors
      theme={theme as "light" | "dark" | "system"}
      closeButton
    />
  );
} 