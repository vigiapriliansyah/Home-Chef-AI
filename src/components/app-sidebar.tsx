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
import { ArrowLeft, SquarePen, Trash2, MoreVertical, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditChatTitleDialog } from "./edit-chat-title-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatSession {
  id: string;
  name: string; // Changed from 'title' to 'name' to match the database schema
  _count?: {
    messages: number;
  };
  createdAt?: Date; // Add createdAt field to track when the chat was created
  updatedAt?: Date; // Add updatedAt field to track when the chat was last updated
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

// Function to group chats by time periods
const groupChatsByDate = (chats: ChatSession[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  return {
    today: chats.filter(chat => {
      const chatDate = new Date(chat.createdAt || new Date());
      return chatDate >= today;
    }),
    yesterday: chats.filter(chat => {
      const chatDate = new Date(chat.createdAt || new Date());
      return chatDate >= yesterday && chatDate < today;
    }),
    lastWeek: chats.filter(chat => {
      const chatDate = new Date(chat.createdAt || new Date());
      return chatDate >= lastWeek && chatDate < yesterday;
    }),
    lastMonth: chats.filter(chat => {
      const chatDate = new Date(chat.createdAt || new Date());
      return chatDate >= lastMonth && chatDate < lastWeek;
    }),
    older: chats.filter(chat => {
      const chatDate = new Date(chat.createdAt || new Date());
      return chatDate < lastMonth;
    })
  };
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
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

  const deleteChat = async (chatId: string) => {
    if (!session?.user?.id) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      // Remove the chat from state
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      toast.success("Chat deleted successfully");

      // If user is currently viewing this chat, navigate to main chat page
      if (window.location.pathname.includes(chatId)) {
        router.push("/chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    } finally {
      setIsDeleting(false);
    }
  };

  const clearAllChats = async () => {
    if (!session?.user?.id) return;

    setIsClearingAll(true);

    try {
      const response = await fetch("/api/chat/clear", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear all chats");
      }

      // Clear chats from state
      setChats([]);

      toast.success("All chats cleared successfully");

      // Navigate to main chat page
      router.push("/chat");
    } catch (error) {
      console.error("Error clearing all chats:", error);
      toast.error("Failed to clear all chats");
    } finally {
      setIsClearingAll(false);
      setShowClearDialog(false);
    }
  };

  // Group chats by date
  const groupedChats = groupChatsByDate(chats);

  // Helper function to render chat items
  const renderChatItems = (chatsList: ChatSession[]) => {
    if (chatsList.length === 0) return null;
    
    return (
      <SidebarMenu className="mt-2">
        {chatsList.map((chat) => (
          <SidebarMenuItem
            key={chat.id}
            className="flex justify-between items-center"
          >
            <Link
              href={`/chat/${chat.id}`}
              className="px-4 py-2 flex-grow text-left block"
            >
              {chat.name && chat.name.length > 30
                ? chat.name.slice(0, 27) + "..."
                : chat.name || "Percakapan Baru"}
            </Link>
            <div className="flex items-center px-2">
              <EditChatTitleDialog
                chatId={chat.id}
                currentTitle={chat.name || ""}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push(`/chat/${chat.id}`)}
                  >
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => deleteChat(chat.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex justify-between p-4 border-r border-[#fdddbd]">
        <div className="flex gap-2">
          <button onClick={() => router.push("/")}>
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

        {/* Clear All Chats Button */}
        {chats.length > 0 && (
          <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <AlertDialogTrigger asChild>
              <div className=" flex justify-between items-center">
                Clear All History
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Chats</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your chats. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    clearAllChats();
                  }}
                  disabled={isClearingAll}
                >
                  {isClearingAll ? "Clearing..." : "Clear All"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </SidebarHeader>
      <SidebarContent className="border-r border-[#fdddbd]">
        {isLoading ? (
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#b58382]"></div>
          </div>
        ) : chats.length > 0 ? (
          <>
            {/* Today's chats */}
            {groupedChats.today.length > 0 && (
              <div className="mt-6">
                <span className="px-4 text-sm font-medium text-gray-500">
                  Hari Ini
                </span>
                {renderChatItems(groupedChats.today)}
              </div>
            )}
            
            {/* Yesterday's chats */}
            {groupedChats.yesterday.length > 0 && (
              <div className="mt-6">
                <span className="px-4 text-sm font-medium text-gray-500">
                  Kemarin
                </span>
                {renderChatItems(groupedChats.yesterday)}
              </div>
            )}
            
            {/* Last week's chats */}
            {groupedChats.lastWeek.length > 0 && (
              <div className="mt-6">
                <span className="px-4 text-sm font-medium text-gray-500">
                  7 Hari Lalu
                </span>
                {renderChatItems(groupedChats.lastWeek)}
              </div>
            )}
            
            {/* Last month's chats */}
            {groupedChats.lastMonth.length > 0 && (
              <div className="mt-6">
                <span className="px-4 text-sm font-medium text-gray-500">
                  30 Hari Lalu
                </span>
                {renderChatItems(groupedChats.lastMonth)}
              </div>
            )}
            
            {/* Older chats */}
            {groupedChats.older.length > 0 && (
              <div className="mt-6">
                <span className="px-4 text-sm font-medium text-gray-500">
                  Lebih Lama
                </span>
                {renderChatItems(groupedChats.older)}
              </div>
            )}
          </>
        ) : (
          <div className="px-4 py-2 text-sm text-gray-500 mt-6">
            No chats yet. Create a new one!
          </div>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
