"use client";

import { KeyboardEvent, useState } from "react";
import { CornerDownLeft } from "lucide-react";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "@/components/ui/button";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: "AI", content: "Halo! Ada yang bisa saya bantu?" },
    { id: 2, sender: "AI", content: "Hello World!" },
  ]);
  const [message, setMessage] = useState("");

  const handleSendMessage = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(message);
    }
  };

  const handleSend = (messageContent: string) => {
    if (!messageContent.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: "User",
      content: messageContent,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage(""); // Reset input setelah pesan dikirim
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-grow p-4 flex flex-col justify-end">
        <ChatMessageList className="flex flex-col gap-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "User" ? "justify-end" : "justify-start"
              }`}
            >
              <ChatBubble isUser={msg.sender === "User"}>
                {msg.sender !== "User"}
                <ChatBubbleMessage
                  variant={msg.sender === "User" ? "sent" : "received"}
                  className={
                    msg.sender === "User"
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
      <footer className="sticky bottom-0 left-0 w-full p-4 border-t bg-background">
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
          />
          <Button
            size="sm"
            className="absolute right-2 bg-gray-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 
      hover:bg-gray-600 transition"
            onClick={() => handleSend(message)}
          >
            Kirim <CornerDownLeft className="size-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
