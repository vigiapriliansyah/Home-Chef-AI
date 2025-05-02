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
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditChatTitleDialog } from "./edit-chat-title-dialog";

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
  const router = useRouter();

  // Load chats from localStorage
  useEffect(() => {
    const loadChats = () => {
      if (session?.user?.email) {
        const stored = localStorage.getItem(`chats-${session.user.email}`);
        if (stored) {
          // Parse and sort chats by most recent first
          const parsedChats = JSON.parse(stored);
          // Assuming newer chats have larger timestamp IDs
          const sortedChats = parsedChats.sort((a: ChatSession, b: ChatSession) => {
            return parseInt(b.id) - parseInt(a.id);
          });
          setChats(sortedChats);
        }
      }
    };

    loadChats();

    // Add event listener to update chats when localStorage changes
    window.addEventListener('storage', loadChats);

    // Refresh chats every 2 seconds (optional, to keep UI in sync)
    const interval = setInterval(loadChats, 2000);

    return () => {
      window.removeEventListener('storage', loadChats);
      clearInterval(interval);
    };
  }, [session]);

  const createNewChat = () => {
    if (!session?.user?.email) return;

    const newChatId = `${Date.now()}`;
    const newChat: ChatSession = {
      id: newChatId,
      title: "Percakapan Baru",
      messages: [],
    };

    // Add new chat to localStorage
    const key = `chats-${session.user.email}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = [newChat, ...existing];
    localStorage.setItem(key, JSON.stringify(updated));
    
    // Trigger storage event for other components to update
    window.dispatchEvent(new Event('storage'));
    
    // Update state
    setChats(updated);

    // Navigate to new chat
    router.push(`/chat/${newChatId}`);
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex justify-between p-4 border-r border-[#fdddbd]">
        <div className="flex gap-2">
          <button onClick={() => router.push('/')}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2 ml-22">
            <button 
              className="text-lg flex items-center" 
              onClick={createNewChat}
            >
              Chat Baru
            </button>
            <button onClick={createNewChat}>
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
                <SidebarMenuItem key={chat.id} className="flex justify-between items-center">
                  <Link
                    href={`/chat/${chat.id}`}
                    className="px-4 py-2 flex-grow text-left block"
                  >
                    {chat.title.length > 30
                      ? chat.title.slice(0, 27) + "..."
                      : chat.title}
                  </Link>
                  <div className="px-2">
                    <EditChatTitleDialog
                      chatId={chat.id}
                      currentTitle={chat.title}
                    />
                  </div>
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
