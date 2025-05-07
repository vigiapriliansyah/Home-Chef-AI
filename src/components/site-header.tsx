"use client";
import { SidebarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { AuthStatus } from "./auth/auth-status";
import { UserDropdown } from "./user-dropdown";
import { ShareDrawer } from "./share-drawer";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex dark:bg-[#0e1627] bg-white h-16 dark:border-b-2 border-b-2 border-gray-600 sticky z-50 top-0 shrink-0 items-center gap-2 px-4">
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
        <img
          src="/logo.jpg"
          alt="HomeChefAI Logo"
          className="w-10 h-10 ml-3 rounded-full"
        />
        <h2 className="ml-3">HomeChefAI</h2>
      </div>

      {/* Spacer to push the ThemeSwitcher to the right */}
      <div className="flex-grow"></div>

      <ShareDrawer />

      <UserDropdown />
    </header>
  );
}
