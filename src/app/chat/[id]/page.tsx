"use client";

import { KeyboardEvent, useState, useEffect, useRef } from "react";
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
import { fetchEventSource } from "@/lib/utils"; // Pastikan path ini benar

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
  const { data: session } = useSession(); // Tetap ambil sesi di sini untuk digunakan di dalam effect dan handleSend
  const params = useParams();
  const chatId = params?.id as string;
  const [chatTitle, setChatTitle] = useState("Memuat Judul...");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const titleUpdateAttempted = useRef(false);

  // Load chat data from the database
  useEffect(() => {
    // Fungsi fetchChat didefinisikan di dalam useEffect
    async function fetchChat() {
      // Gunakan 'session' yang didapat dari useSession di luar useEffect
      // Periksa session dan chatId *sebelum* melakukan fetch
      if (!session?.user?.id || !chatId) {
         // Jika tidak ada chatId, mungkin belum siap atau rute salah
         if (!chatId) {
            setIsInitialLoading(false); // Berhenti loading jika chatId tidak ada
            // Mungkin tampilkan pesan error atau tunggu chatId di-resolve
            // console.warn("Chat ID belum tersedia.");
            return;
         }
         // Jika tidak ada sesi (meskipun layout harusnya sudah handle), set error
         if (!session?.user?.id) {
             setIsInitialLoading(false);
             setError("Sesi tidak ditemukan atau tidak valid.");
             toast.error("Sesi tidak valid. Silakan login kembali.");
             // router.push('/api/auth/signin'); // Redirect jika perlu
             return;
         }
      }

      console.log(`Fetching chat for ID: ${chatId}`); // Debug log
      setIsInitialLoading(true);
      setError(null);
      titleUpdateAttempted.current = false;

      try {
        const response = await fetch(`/api/chat/${chatId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Chat tidak ditemukan.");
            toast.error("Chat tidak ditemukan.");
            return;
          }
          const errorData = await response.json().catch(() => ({ error: "Gagal mengambil detail error" }));
          throw new Error(errorData.error || `Gagal mengambil chat (Status: ${response.status})`);
        }

        const data: ChatChannel = await response.json();
        setChatTitle(data.name || "Percakapan Baru");

        // Hanya update messages jika tidak sedang dalam proses streaming AI
        if (!isLoading) {
           setMessages((prevMessages) => {
             const tempMessage = prevMessages.find(msg => msg.id.toString().startsWith('temp-'));
             const fetchedMessages = data.messages || [];
             if (tempMessage) {
               const existingTempIndex = fetchedMessages.findIndex(msg => msg.id === tempMessage.id);
               if (existingTempIndex === -1) return [...fetchedMessages, tempMessage];
               else {
                 const updatedMessages = [...fetchedMessages];
                 updatedMessages[existingTempIndex] = tempMessage;
                 return updatedMessages;
               }
             }
             return fetchedMessages;
           });
        } else {
            console.log("Skipping message update because isLoading is true."); // Debug log
        }

      } catch (err) {
        console.error("Error fetching chat:", err);
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil chat";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsInitialLoading(false);
      }
    }

    // Panggil fetchChat hanya jika chatId tersedia
    if (chatId) {
        fetchChat();
    } else {
        // Jika chatId belum ada saat effect pertama kali jalan, set loading false
        setIsInitialLoading(false);
    }


    // Cleanup function untuk abort controller
    return () => {
        console.log("Cleaning up ChatPage effect"); // Debug log
        abortController?.abort();
    };
    // Array dependensi HANYA berisi chatId.
    // Effect ini akan dijalankan ulang HANYA jika chatId berubah.
  }, [chatId]); // <--- PERUBAHAN UTAMA DI SINI

  // --- (handleSendMessage, handleCancelGeneration, handleSend tetap sama seperti sebelumnya) ---
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
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => !msg.id.toString().startsWith('temp-'))
      );
      toast.info("Pembuatan respons dibatalkan.");
    }
  };

  const handleSend = async (messageContent: string) => {
    const trimmedMessage = messageContent.trim();
    // Periksa sesi di sini juga sebelum mengirim
    if (!trimmedMessage || isLoading || !chatId || !session?.user?.id) {
        if (!session?.user?.id) {
            toast.error("Sesi tidak valid. Tidak dapat mengirim pesan.");
        }
        return;
    }


    setIsLoading(true);
    setError(null);

    // Check if title needs update
    const isFirstMessageEver = messages.length === 0;
    const needsTitleUpdate = chatTitle === "Percakapan Baru" && isFirstMessageEver && !titleUpdateAttempted.current;
    const potentialNewTitle = trimmedMessage;

    if (needsTitleUpdate) {
        titleUpdateAttempted.current = true;
    }

    try {
      // Update title BEFORE saving the message if needed
      if (needsTitleUpdate) {
        const newTitle = potentialNewTitle.length > 30
          ? potentialNewTitle.slice(0, 27) + "..."
          : potentialNewTitle;

        try {
            const updateTitleResponse = await fetch(`/api/chat/${chatId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: newTitle }), // Ensure backend expects 'name'
            });

            if (!updateTitleResponse.ok) {
               console.error("Gagal memperbarui judul chat di DB.");
               toast.error("Gagal memperbarui judul chat.");
               titleUpdateAttempted.current = false; // Revert flag if DB update failed
            } else {
               setChatTitle(newTitle); // Update title in ChatPage state immediately
               // Sidebar will update via its polling mechanism
            }
        } catch (titleError) {
             console.error("Error updating chat title:", titleError);
             toast.error("Error saat memperbarui judul chat.");
             titleUpdateAttempted.current = false; // Revert flag
        }
      }

      // Save user message
      const userMessageResponse = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmedMessage, role: "user" }),
      });

      if (!userMessageResponse.ok) {
        throw new Error("Gagal menyimpan pesan pengguna");
      }

      const userMessage = await userMessageResponse.json();
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setMessage(""); // Clear input

      // Start AI Response Generation
      const controller = new AbortController();
      setAbortController(controller);

      const tempMessageId = `temp-${Date.now()}`;
      const tempAiMessage: Message = {
        id: tempMessageId, content: "", role: "assistant",
        channelId: chatId, createdAt: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, tempAiMessage]);

      let accumulatedText = "";

      try {
        await fetchEventSource("http://localhost:8000/generate", { // Ensure URL is correct
          signal: controller.signal,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { prompt: trimmedMessage, max_tokens: 512, temperature: 0.7 },
          onChunk: (chunk) => {
            if (chunk) {
              accumulatedText += chunk;
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === tempMessageId ? { ...msg, content: accumulatedText } : msg
                )
              );
            }
          },
          onDone: async () => {
            setAbortController(null);
            try {
              if (accumulatedText.trim()) {
                const aiMessageResponse = await fetch(`/api/chat/${chatId}/messages`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: accumulatedText, role: "assistant" }),
                });
                if (!aiMessageResponse.ok) throw new Error("Gagal menyimpan respons AI");
                const aiMessage = await aiMessageResponse.json();
                setMessages((prevMessages) =>
                  prevMessages.map((msg) => msg.id === tempMessageId ? aiMessage : msg)
                );
              } else {
                setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== tempMessageId));
                toast.error("Tidak ada respons yang dihasilkan.");
              }
            } catch (error) {
              console.error("Error saving AI message:", error);
              toast.error(error instanceof Error ? error.message : "Gagal menyimpan respons AI");
            } finally {
              setIsLoading(false);
            }
          },
          onError: (error) => {
            if (error.name !== "AbortError") {
                console.error("Error in streaming response:", error);
                toast.error("Error streaming: " + (error.message || "Gagal memproses permintaan"));
                setMessages((prevMessages) => {
                    const tempMsg = prevMessages.find(msg => msg.id === tempMessageId);
                    if (tempMsg && tempMsg.content.trim()) {
                      return prevMessages.map(msg =>
                          msg.id === tempMessageId ? { ...msg, content: msg.content + " (Gagal menyimpan)" } : msg
                      );
                    }
                    return prevMessages.filter((msg) => msg.id !== tempMessageId);
                });
                setIsLoading(false);
                setAbortController(null);
            }
          }
        });
      } catch (streamError) {
         console.error("Error setting up streaming:", streamError);
         toast.error("Error memulai generasi: " + (streamError instanceof Error ? streamError.message : "Unknown error"));
         setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== tempMessageId));
         setIsLoading(false);
         setAbortController(null);
      }
    } catch (error) { // Outer catch
      console.error("Error dalam alur chat:", error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
      setIsLoading(false);
      setAbortController(null);
    }
  };


  // --- Render Logic (tetap sama, menggunakan gaya asli Anda) ---

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b58382]"></div>
      </div>
    );
  }

  if (error && !isInitialLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error Memuat Chat</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => router.push("/chat")}>
          Kembali ke Daftar Chat
        </Button>
         <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
           Coba Lagi
         </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      {chatId && (
        <div className="bg-background border-b px-4 py-2 flex justify-between items-center">
          <h1 className="text-lg font-medium">{chatTitle}</h1>
          <div className="flex items-center">
            <EditChatTitleDialog
              chatId={chatId}
              currentTitle={chatTitle}
              onTitleUpdated={(updatedTitle) => {
                  setChatTitle(updatedTitle);
              }}
            />
            <ShareDrawer />
          </div>
        </div>
      )}

      {/* Message List */}
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

      {/* Chat Input Footer */}
      <footer className="p-4 border-t bg-background sticky bottom-0">
        <form
          className="relative flex items-center max-w-5xl mx-auto rounded-2xl bg-gray-300 p-3"
          onSubmit={(e) => {
              e.preventDefault();
              handleSend(message);
          }}
        >
          <ChatInput
            placeholder="Masukkan pesan..."
            className="w-full min-h-12 resize-none rounded-2xl bg-gray-300 border-0 p-3 text-gray-700 placeholder-gray-500 focus:ring-0 focus:ring-offset-0 focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleSendMessage}
            disabled={isLoading}
          />
          {isLoading ? (
            <Button
              size="sm"
              className="absolute right-2 bg-red-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 hover:bg-red-600 transition"
              onClick={handleCancelGeneration}
              type="button"
            >
              Cancel <X className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 bg-gray-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 hover:bg-gray-600 transition"
              disabled={!message.trim()}
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