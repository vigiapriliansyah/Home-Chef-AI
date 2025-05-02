"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
}

export default function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      // Not authenticated, redirect to login
      router.push("/");
      return;
    }

    // User is authenticated, check if they have any chats
    if (session.user?.email) {
      const storedChats = localStorage.getItem(`chats-${session.user.email}`);
      const chats = storedChats ? JSON.parse(storedChats) : [];

      if (chats.length === 0) {
        // No chats found, create a new one
        const newChatId = `${Date.now()}`;
        const newChat: ChatSession = {
          id: newChatId,
          title: "Percakapan Baru",
          messages: [],
        };

        // Save to localStorage
        localStorage.setItem(`chats-${session.user.email}`, JSON.stringify([newChat]));
        
        // Redirect to the new chat
        router.push(`/chat/${newChatId}`);
      } else {
        // User has chats, redirect to the most recent one
        // Sort chats by ID (assuming newer chats have larger timestamp IDs)
        const sortedChats = [...chats].sort((a, b) => parseInt(b.id) - parseInt(a.id));
        if (sortedChats.length > 0) {
          router.push(`/chat/${sortedChats[0].id}`);
        }
      }
    }
  }, [session, status, router]);

  // Return null as this is just a redirect component
  return null;
} 