// File: SettingSidebar.tsx
"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"; // Pastikan path ini benar
import { ThemeSwitcherSwitch } from "@/components/ui/theme-switcher"; // Pastikan path ini benar
import { History, Moon, Settings as SettingsIcon } from "lucide-react"; // Mengganti nama import Settings agar tidak konflik
import { AuthStatus } from "./auth/auth-status"; // Pastikan path ini benar
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";

export default function SettingSidebar() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      console.log("SIDEBAR: Data Sesi Diterima:", session?.user);
    } else if (status === "loading") {
      console.log("SIDEBAR: Sesi sedang dimuat...");
    } else {
      console.log("SIDEBAR: Status Sesi di Sidebar:", status);
    }
  }, [session, status]);

  const userName = session?.user?.name || "Home Chef AI"; // Fallback default
  const userEmail = session?.user?.email || "homechef@mail.domain.com"; // Fallback default
  const imageKey =
    session?.user?.image || session?.user?.id || "default-sidebar-profile"; // Key untuk re-render Image
  const imageUrl = session?.user?.image || "/profile.png"; // Fallback default

  return (
    <Sidebar className="h-full">
      <SidebarHeader className="flex flex-col items-center px-4 py-6 border-r border-[#fdddbd]">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-2 relative bg-gray-200 dark:bg-gray-700">
          {status === "loading" ? (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
          ) : (
            <Image
              key={imageKey}
              src={imageUrl}
              alt="Profil"
              width={64}
              height={64}
              className="rounded-full object-cover w-full h-full" // Pastikan object-cover dan w-full h-full
              priority
            />
          )}
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-sm font-semibold dark:text-white truncate w-full px-2">
            {userName}
          </span>
          <span className="text-xs text-muted-foreground truncate w-full px-2">
            {userEmail}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="border-r border-[#fdddbd] py-6">
        <SidebarMenu className="space-y-4 px-4">
          <SidebarMenuItem>
            <Link href="/settings" passHref legacyBehavior>
              <SidebarMenuButton
                as="a"
                className="flex items-center gap-2 w-full text-left hover:text-pink-500 dark:hover:text-gray-800"
              >
                <SettingsIcon size={16} />
                <span>Info Pribadi</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <div className="ml-2 flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Moon size={16} />
                <span>Mode Gelap</span>
              </div>
              <ThemeSwitcherSwitch />
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Link href="/settings/history" passHref legacyBehavior>
              <SidebarMenuButton
                as="a"
                className="flex items-center gap-2 w-full text-left hover:text-pink-500 dark:hover:text-gray-800"
              >
                <History size={16} />
                <span>Riwayat Obrolan</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <div className="px-4 pb-6 border-t border-border mt-auto">
        <div className="text-sm text-red-500 hover:text-red-400 cursor-pointer flex items-center gap-2 pt-4">
          <AuthStatus />
        </div>
      </div>
      <SidebarRail />
    </Sidebar>
  );
}
