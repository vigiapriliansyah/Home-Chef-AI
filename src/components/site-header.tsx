"use client";
import { SidebarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "./ui/theme-switcher";
import { AuthStatus } from "./auth/auth-status";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex h-16 bg-sidebar dark:border-b-2 border-b-2 border-gray-600 sticky z-50 top-0 shrink-0 items-center gap-2 px-4">
      {/* Left section with menu button */}
      <div className="flex items-center">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
      </div>

      {/* Spacer to push the ThemeSwitcher to the right */}
      <div className="flex-grow"></div>
      <AuthStatus />
      <ThemeSwitcher />
    </header>
  );
}
