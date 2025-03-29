import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuthStatus } from "@/components/auth/auth-status"
import { User, Settings, LogOut } from "lucide-react"

export function UserDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-2 rounded-full border border-[#0e1627] dark:border-gray-300 w-9 mx-2">
          <User className="w-6 h-6 " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-[#2b2b2b] text-white border border-[#3a3a3a] rounded-lg shadow-lg"
      >
        <DropdownMenuItem className="flex items-center gap-2 text-white hover:bg-[#3a3a3a]">
          <Settings className="text-sm font-medium text-white hover:bg-gray-400 w-full" />
          Settings
        </DropdownMenuItem>
        <AuthStatus />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
