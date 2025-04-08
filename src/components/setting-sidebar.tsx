"use client";

import { History, LogOut, Moon, Settings, Trash2 } from "lucide-react";
import { ThemeSwitcherSwitch } from "@/components/ui/theme-switcher";
import Image from "next/image";
import { AuthStatus } from "./auth/auth-status";

export default function SettingSidebar() {
  return (
    <div className="flex flex-col h-full justify-between p-6">
      {/* Top Profile */}
      <div>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-400 overflow-hidden mb-2">
            <Image
              src="/profile.png"
              alt="profile"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              Username
            </div>
            <div className="text-sm text-muted-foreground">
              homechef@fusi.com
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-6 text-sm text-foreground">
          <div className="flex items-center gap-2 cursor-pointer hover:text-pink-500 dark:hover:text-pink-300">
            <Settings size={16} />
            <span>Personal Info</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon size={16} />
              <span>Dark Mode</span>
            </div>
            <ThemeSwitcherSwitch />
          </div>

          <div className="flex items-center gap-2 cursor-pointer">
            <History size={16} />
            <span>Chat History</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="pt-6 border-t border-border mt-6">
        <div className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 cursor-pointer">
          <AuthStatus />
        </div>
      </div>
    </div>
  );
}
