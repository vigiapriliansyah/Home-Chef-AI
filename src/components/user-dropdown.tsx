import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthStatus } from "@/components/auth/auth-status";
import { User, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export function UserDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="p-2 rounded-full border border-[#0e1627] dark:border-gray-300 w-9 mx-2"
        >
          <User className="w-6 h-6 " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 dark:bg-[#2b2b2b] text-white border border-[#3a3a3a] rounded-lg shadow-lg"
      >
        <Link href="/settings" className="w-full">
          <DropdownMenuItem className="flex items-center gap-2 dark:text-white text-black hover:bg-[#3a3a3a] px-2 py-2">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="flex items-center gap-2 text-white">
          <AuthStatus />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
