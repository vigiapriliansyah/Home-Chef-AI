import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ArrowLeft, SquarePen } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
}

// This is sample data.
const data = {
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Installation",
          url: "#",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
    {
      title: "Today",
      url: "#",
      items: [
        {
          title: "Routing",
          url: "#",
        },
        {
          title: "Data Fetching",
          url: "#",
          isActive: true,
        },
        {
          title: "Rendering",
          url: "#",
        },
      ],
    },
    {
      title: "Yesterday",
      url: "#",
      items: [
        {
          title: "Components",
          url: "#",
        },
        {
          title: "File Conventions",
          url: "#",
        },
      ],
    },
    {
      title: "7 days ago",
      url: "#",
      items: [
        {
          title: "Accessibility",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<ChatSession[]>([]);

  React.useEffect(() => {
    if (session?.user?.email) {
      const stored = localStorage.getItem(`chats-${session.user.email}`);
      if (stored) {
        setChats(JSON.parse(stored));
      }
    }
  }, [session]);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex justify-between p-4 border-r border-[#fdddbd]">
        <div className="flex gap-2">
          <button>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2 ml-22">
            <span className="text-lg">Chat Baru</span>
            <button>
              <SquarePen className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="border-r border-[#fdddbd]">
        <div className="mt-6">
          <span className="px-4 text-sm font-medium text-gray-500">
            Hari Ini
          </span>
          {chats.length > 0 && (
            <SidebarMenu className="mt-2">
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <Link
                    href={`/chat?session=${chat.id}`}
                    className="px-4 py-2 w-full text-left block"
                  >
                    {chat.title.length > 30
                      ? chat.title.slice(0, 27) + "..."
                      : chat.title}
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </div>
        <div className="mt-6">
          <span className="px-4 text-sm font-medium text-gray-500">
            7 Hari Lalu
          </span>
          {/* Add more menu items here if needed */}
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
