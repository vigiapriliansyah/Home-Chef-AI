"use client";

import { KeyboardEvent, useState, useEffect } from "react";
import { CornerDownLeft, X } from "lucide-react";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface ChatSession {
  id: string;
  title: string;
  messages: Message[]
}
interface Message {
  id: number;
  sender: "User" | "AI";
  content: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { data: session } = useSession();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId && messages.length >= 2 && session?.user?.email) {
      const userMessage = messages.find((msg) => msg.sender === "User");
      const newSessionId = `${Date.now()}`;
      const newChat: ChatSession = {
        id: newSessionId,
        title: userMessage?.content || "Percakapan Baru",
        messages,
      };
      saveChatToLocalStorage(session.user.email, newChat);
      setSessionId(newSessionId);
    }
  }, [messages, session, sessionId]);
  

  const saveChatToLocalStorage = (email: string, chat:ChatSession)=>{
    const key = `chats-${email}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = [...existing.filter((c: ChatSession) => c.id !== chat.id), chat];
    localStorage.setItem(key, JSON.stringify(updated));
  }

  const handleSendMessage = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(message);
    }
  };

  const handleCancelGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  };

  const handleSend = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(), // Using timestamp for unique ID
      sender: "User" as const,
      content: messageContent,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessage("");
    setIsLoading(true);

    // Create a new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Create a temporary message for the AI response that will be updated
      const tempAiMessageId = Date.now() + 1; // Ensure unique ID with timestamp + 1
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: tempAiMessageId, sender: "AI", content: "" },
      ]);

      // Call the API with streaming response
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: messageContent,
          max_tokens: 512,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Handle the streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is not readable");

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);

        // Parse the SSE format (data: {...})
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.substring(6); // Remove "data: " prefix
              const data = JSON.parse(jsonStr);

              if (data.text) {
                accumulatedText += data.text;

                // Update the AI message with accumulated text
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === tempAiMessageId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error calling AI API:", error);
        // Add an error message
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now() + 2, // Ensure unique ID
            sender: "AI",
            content: "Sorry, I encountered an error processing your request.",
          },
        ]);
      } else {
        // Handle abort case
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now() + 2, // Ensure unique ID
            sender: "AI",
            content: "Generation was cancelled.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
       <main className="flex-1 overflow-y-auto p-4 bg-background">
       <ChatMessageList className="flex flex-col gap-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "User" ? "justify-end" : "justify-start"
              }`}
            >
              <ChatBubble>
                <ChatBubbleMessage
                  variant={msg.sender === "User" ? "sent" : "received"}
                  className={
                    msg.sender === "User"
                      ? "dark:bg-[#f2f2f2] text-black self-end bg-gray-400"
                      : "bg-[#f5e1e0] text-gray-800 self-start"
                  }
                >
                  {msg.content}
                  {msg.sender === "AI" &&
                    isLoading &&
                    msg.id === messages[messages.length - 1]?.id && (
                      <span className="inline-block ml-1 animate-pulse">▌</span>
                    )}
                </ChatBubbleMessage>
              </ChatBubble>
            </div>
          ))}
        </ChatMessageList>
      </main>
      <footer className="p-4 border-t bg-background sticky bottom-0">
      <form
          className="relative flex items-center max-w-5xl mx-auto rounded-2xl bg-gray-300 p-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <ChatInput
            placeholder="Masukkan pesan..."
            className="w-full min-h-12 resize-none rounded-2xl bg-gray-300 border-0 p-3 text-gray-700 placeholder-gray-500 
      focus:ring-0 focus:ring-offset-0 focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleSendMessage}
            disabled={isLoading}
          />
          {isLoading ? (
            <Button
              size="sm"
              className="absolute right-2 bg-red-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 
      hover:bg-red-600 transition"
              onClick={handleCancelGeneration}
            >
              Cancel <X className="size-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="absolute right-2 bg-gray-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 
      hover:bg-gray-600 transition"
              onClick={() => handleSend(message)}
              disabled={isLoading}
            >
              Kirim <CornerDownLeft className="size-4" />
            </Button>
          )}
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
