"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ChatBubble, 
  ChatBubbleMessage 
} from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Home, User } from "lucide-react";
import Image from "next/image";

interface Message {
  id: string;
  content: string;
  role: string;
  createdAt: string;
}

interface SharedChat {
  id: string;
  name: string;
  messages: Message[];
  user: {
    name: string | null;
    image: string | null;
  };
}

export default function SharedChatPage() {
  const params = useParams();
  const shareId = params?.shareId as string;
  const [chat, setChat] = useState<SharedChat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedChat() {
      try {
        if (!shareId) return;
        
        const response = await fetch(`/api/shared/${shareId}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to fetch shared chat");
        }
        const data = await response.json();
        setChat(data);
      } catch (err) {
        console.error("Error fetching shared chat:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch shared chat");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSharedChat();
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b58382]"></div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Shared Chat Not Found</h1>
        <p className="text-gray-600 mb-6">{error || "The shared chat you're looking for doesn't exist or has been removed."}</p>
        <Link href="/">
          <Button>
            <Home className="mr-2 h-4 w-4" /> Go Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            <Home className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white ml-4">
            {chat.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Shared by</span>
          <div className="flex items-center">
            {chat.user.image ? (
              <Image 
                src={chat.user.image} 
                alt={chat.user.name || "User"} 
                width={24} 
                height={24} 
                className="rounded-full"
              />
            ) : (
              <User className="h-5 w-5 text-gray-400" />
            )}
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {chat.user.name || "Anonymous"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-auto">
        <ChatMessageList className="max-w-3xl mx-auto">
          {chat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <ChatBubble>
                <ChatBubbleMessage
                  variant={msg.role === "user" ? "sent" : "received"}
                  className={
                    msg.role === "user"
                      ? "dark:bg-[#f2f2f2] text-black self-end bg-gray-400"
                      : "bg-[#f5e1e0] text-gray-800 self-start"
                  }
                >
                  {msg.content}
                </ChatBubbleMessage>
              </ChatBubble>
            </div>
          ))}
        </ChatMessageList>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This is a shared conversation from Home Chef AI.
        </p>
        <Link href="/">
          <Button variant="outline" className="mt-2">
            Try Home Chef AI
          </Button>
        </Link>
      </footer>
    </div>
  );
} 