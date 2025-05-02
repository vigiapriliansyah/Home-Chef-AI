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
  name: string; // Changed from 'title' to 'name' to match the database schema
  _count?: {
    messages: number;
  };
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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load chats from the database
  useEffect(() => {
    const fetchChats = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/chat");
        if (!response.ok) {
          throw new Error("Failed to fetch chats");
        }
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchChats();
    } else {
      setIsLoading(false);
    }

    // Set up a polling interval to refresh chats (optional)
    const interval = setInterval(() => {
      if (session?.user?.id) {
        fetchChats();
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [session]);

  const createNewChat = async () => {
    if (!session?.user?.id) return;

    try {
      // Create a new chat in the database
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Percakapan Baru",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create new chat");
      }

      const newChat = await response.json();

      // Update state
      setChats((prevChats) => [newChat, ...prevChats]);

      // Navigate to new chat
      router.push(`/chat/${newChat.id}`);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
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
          {isLoading ? (
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#b58382]"></div>
            </div>
          ) : chats.length > 0 ? (
            <SidebarMenu className="mt-2">
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id} className="flex justify-between items-center">
                  <Link
                    href={`/chat/${chat.id}`}
                    className="px-4 py-2 flex-grow text-left block"
                  >
                    {chat.name && chat.name.length > 30
                      ? chat.name.slice(0, 27) + "..."
                      : chat.name || "Percakapan Baru"}
                  </Link>
                  <div className="px-2">
                    <EditChatTitleDialog
                      chatId={chat.id}
                      currentTitle={chat.name || ""}
                    />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No chats yet. Create a new one!
            </div>
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
