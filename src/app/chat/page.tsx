"use client"; // Tambahkan ini di bagian paling atas

import { KeyboardEvent, useState } from "react";
import { CornerDownLeft, Mic, Paperclip, Send } from "lucide-react";
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
  ]);
  const [message, setMessage] = useState("");

  const handleSendMessage = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault(); 
    if (!message.trim()) return; 

    setMessage(message); 

    setMessage("");
  };

  const handleSend = (messageContent: string) => {
    const newMessage = {
      id: messages.length + 1,
      sender: "User",
      content: messageContent,
    };
    setMessages([...messages, newMessage]);

  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-grow p-4 flex flex-col justify-end">
        <ChatMessageList className="flex flex-col gap-2">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} isUser={msg.sender === "User"}>
              <ChatBubbleAvatar />
              <ChatBubbleMessage>{msg.content}</ChatBubbleMessage>
            </ChatBubble>
          ))}
        </ChatMessageList>
      </main>
      <footer className="sticky bottom-0 left-0 w-full p-4 border-t bg-background">
        <form className="relative flex items-center w-full rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1">
          <ChatInput
            placeholder="Type your message here..."
            className="w-full min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); 
                handleSendMessage(e); 
              }
            }}
          />
          <Button size="sm" className="ml-2">
            Send <CornerDownLeft className="size-3.5" />
          </Button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
