"use client";

import { KeyboardEvent, useState, useEffect } from "react";
import { CornerDownLeft, X } from "lucide-react";
import {
  ChatBubble,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { EditChatTitleDialog } from "@/components/edit-chat-title-dialog";
import { ShareDrawer } from "@/components/share-drawer";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  role: string;
  channelId: string;
  createdAt: string;
}

interface ChatChannel {
  id: string;
  name: string;
  messages: Message[];
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { data: session } = useSession();
  const params = useParams();
  const chatId = params?.id as string;
  const [chatTitle, setChatTitle] = useState("Percakapan Baru");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Load chat data from the database
  useEffect(() => {
    async function fetchChat() {
      if (!session?.user?.id || !chatId) return;
      
      try {
        const response = await fetch(`/api/chat/${chatId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Chat not found, navigate to main chat page
            // router.push("/chat");
            return;
          }
          
          const error = await response.json();
          throw new Error(error.error || "Failed to fetch chat");
        }
        
        const data: ChatChannel = await response.json();
        
        setChatTitle(data.name || "Percakapan Baru");
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Error fetching chat:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch chat");
        toast.error("Failed to load chat");
      } finally {
        setIsInitialLoading(false);
      }
    }
    
    fetchChat();
    
    // Polling for new messages (optional)
    const interval = setInterval(() => {
      if (session?.user?.id && chatId) {
        fetchChat();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [session, chatId, router]);

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
    if (!messageContent.trim() || isLoading || !chatId || !session?.user?.id) return;

    setIsLoading(true);

    try {
      // Save user message to the database
      const userMessageResponse = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageContent,
          role: "user",
        }),
      });

      if (!userMessageResponse.ok) {
        throw new Error("Failed to save user message");
      }

      const userMessage = await userMessageResponse.json();
      
      // Update local messages
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setMessage("");

      // Create a new AbortController for the AI request
      const controller = new AbortController();
      setAbortController(controller);

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
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }

      // Save AI response to the database
      const aiMessageResponse = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: accumulatedText,
          role: "assistant",
        }),
      });

      if (!aiMessageResponse.ok) {
        throw new Error("Failed to save AI message");
      }

      const aiMessage = await aiMessageResponse.json();
      
      // Update local messages
      setMessages((prevMessages) => [...prevMessages, aiMessage]);

      // If this is a new chat with no title, use the first user message as the title
      if (chatTitle === "Percakapan Baru" && messages.length === 0) {
        const newTitle = messageContent.length > 30 
          ? messageContent.slice(0, 27) + "..."
          : messageContent;
        
        // Update chat title in the database
        await fetch(`/api/chat/${chatId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newTitle,
          }),
        });
        
        setChatTitle(newTitle);
      }
    } catch (error) {
      console.error("Error in chat flow:", error);
      
      if (error instanceof Error && error.name !== "AbortError") {
        // Add an error message to the UI
        toast.error("Error: " + (error.message || "Failed to process request"));
      } else {
        // Handle abort case
        toast.info("Generation was cancelled");
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b58382]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Error Loading Chat</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => router.push("/chat")}>
          Go to Chats
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {chatId && (
        <div className="bg-background border-b px-4 py-2 flex justify-between items-center">
          <h1 className="text-lg font-medium">{chatTitle}</h1>
          <div className="flex items-center">
            <EditChatTitleDialog 
              chatId={chatId} 
              currentTitle={chatTitle} 
              onTitleUpdated={() => {
                // Refresh chat data
                fetch(`/api/chat/${chatId}`)
                  .then(response => response.json())
                  .then(data => {
                    setChatTitle(data.name || "Percakapan Baru");
                  })
                  .catch(error => console.error("Error refreshing chat:", error));
              }} 
            />
            <ShareDrawer />
          </div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto p-4 bg-background">
        <ChatMessageList className="flex flex-col gap-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
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
                  {msg.role === "assistant" &&
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
