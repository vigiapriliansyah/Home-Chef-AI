"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ThemeSwitcherSwitch } from "@/components/ui/theme-switcher";
import { History, LogOut, Moon, Settings } from "lucide-react";
import { AuthStatus } from "./auth/auth-status";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SettingSidebar() {
  const { data: session } = useSession();

  return (
    <Sidebar className="h-full">
      {/* Header ala AppSidebar tapi isinya avatar + nama */}
      <SidebarHeader className="flex flex-col items-center px-4 py-6 border-r border-[#fdddbd]">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
          <Image
            src={session?.user?.image || "/profile.png"}
            alt="profile"
            width={64}
            height={64}
            className="rounded-full"
          />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold dark:text-white">
            {session?.user?.name || "Home Chef AI"}
          </span>
          <span className="text-xs text-muted-foreground">
            {session?.user?.email || "homechen@mail.domain.com"}
          </span>
        </div>
      </SidebarHeader>

      {/* Menu */}
      <SidebarContent className="border-r border-[#fdddbd] py-6">
        <SidebarMenu className="space-y-4 px-4">
          <SidebarMenuItem>
            <Link href="/settings" passHref>
              <SidebarMenuButton className="flex items-center gap-2 w-full text-left hover:text-pink-500 dark:hover:text-gray-800">
                <Settings size={16} />
                <span>Personal Info</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <div className="ml-2 flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Moon size={16} />
                <span>Dark Mode</span>
              </div>
              <ThemeSwitcherSwitch />
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/settings/history" passHref>
              <SidebarMenuButton className="flex items-center gap-2 w-full text-left hover:text-pink-500 dark:hover:text-gray-800">
                <History size={16} />
                <span>Chat History</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* Auth / Logout */}
      <div className="px-4 pb-6 border-t border-border mt-auto">
        <div className="text-sm text-red-500 hover:text-red-400 cursor-pointer flex items-center gap-2 pt-4">
          <AuthStatus />
        </div>
      </div>

      <SidebarRail />
    </Sidebar>
  );
}
