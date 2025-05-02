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
import { fetchEventSource } from "@/lib/utils";

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
        
        // Only update messages if we're not currently in a loading state
        // This prevents wiping out in-progress streaming messages
        if (!isLoading) {
          setMessages((prevMessages) => {
            // Keep any temporary message that might be currently streaming
            const tempMessage = prevMessages.find(msg => msg.id.toString().startsWith('temp-'));
            
            if (tempMessage) {
              // Add the temp message to the fetched messages if it doesn't exist there
              const updatedMessages = [...data.messages];
              if (!updatedMessages.some(msg => msg.id === tempMessage.id)) {
                updatedMessages.push(tempMessage);
              }
              return updatedMessages;
            }
            
            return data.messages || [];
          });
        }
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
      if (session?.user?.id && chatId && !isLoading) {
        fetchChat();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [session, chatId, router, isLoading]);

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
      
      // Remove any temporary message
      setMessages((prevMessages) => 
        prevMessages.filter((msg) => !msg.id.toString().startsWith('temp-'))
      );
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

      // Create a temporary AI message object with an optimistic ID
      const tempMessageId = `temp-${Date.now()}`;
      const tempAiMessage: Message = {
        id: tempMessageId,
        content: "",
        role: "assistant",
        channelId: chatId,
        createdAt: new Date().toISOString(),
      };
      
      // Add the temporary message to the state
      setMessages((prevMessages) => [...prevMessages, tempAiMessage]);
      
      let accumulatedText = "";

      try {
        // Use the fetchEventSource utility to handle the streaming response
        await fetchEventSource("http://localhost:8000/generate", {
          body: {
            prompt: messageContent,
            max_tokens: 512,
            temperature: 0.7,
          },
          onChunk: (chunk) => {
            if (chunk) {
              // Append the new chunk to the accumulated text
              accumulatedText += chunk;
              
              // Update the temporary message with the accumulated text
              setMessages((prevMessages) => 
                prevMessages.map((msg) => 
                  msg.id === tempMessageId 
                    ? { ...msg, content: accumulatedText }
                    : msg
                )
              );
            }
          },
          onDone: async () => {
            try {
              if (accumulatedText.trim()) {
                // Save the complete AI response to the database
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
                
                // Replace the temporary message with the saved one
                setMessages((prevMessages) => 
                  prevMessages.map((msg) => 
                    msg.id === tempMessageId ? aiMessage : msg
                  )
                );

                // If this is a new chat with no title, use the first user message as the title
                if (chatTitle === "Percakapan Baru" && messages.length === 1) {
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
              } else {
                // If no text was generated, remove the temporary message
                setMessages((prevMessages) => 
                  prevMessages.filter((msg) => msg.id !== tempMessageId)
                );
                toast.error("No response was generated. Please try again.");
              }
            } catch (error) {
              console.error("Error saving AI message:", error);
              toast.error("Failed to save AI response");
              
              // Keep the temporary message with its content if saving failed
              // This way the user doesn't lose the AI's response
            } finally {
              setIsLoading(false);
              setAbortController(null);
            }
          },
          onError: (error) => {
            console.error("Error in streaming response:", error);
            
            if (error.name !== "AbortError") {
              // Add an error message to the UI
              toast.error("Error: " + (error.message || "Failed to process request"));
              
              // Keep the temporary message if it has content
              setMessages((prevMessages) => {
                const tempMsg = prevMessages.find(msg => msg.id === tempMessageId);
                if (tempMsg && tempMsg.content.trim()) {
                  return prevMessages;
                }
                return prevMessages.filter((msg) => msg.id !== tempMessageId);
              });
            } else {
              // Handle abort case
              toast.info("Generation was cancelled");
              
              // Remove the temporary message if cancelled
              setMessages((prevMessages) => 
                prevMessages.filter((msg) => msg.id !== tempMessageId)
              );
            }
            
            setIsLoading(false);
            setAbortController(null);
          }
        });
      } catch (error) {
        console.error("Error in streaming:", error);
        
        // Remove temporary message on error
        setMessages((prevMessages) => 
          prevMessages.filter((msg) => msg.id !== tempMessageId)
        );
        
        setIsLoading(false);
        setAbortController(null);
        throw error; // Re-throw to be caught by the outer try-catch
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
                   msg.id.toString().startsWith('temp-') && (
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
