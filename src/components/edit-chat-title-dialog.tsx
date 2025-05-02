"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import { useSession } from "next-auth/react";

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
}

interface EditChatTitleDialogProps {
  chatId: string;
  currentTitle: string;
  onTitleUpdated?: () => void;
}

export function EditChatTitleDialog({
  chatId,
  currentTitle,
  onTitleUpdated,
}: EditChatTitleDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const handleSave = () => {
    if (!session?.user?.email || !title.trim()) return;

    const key = `chats-${session.user.email}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    
    const updatedChats = existing.map((chat: ChatSession) => {
      if (chat.id === chatId) {
        return { ...chat, title: title.trim() };
      }
      return chat;
    });
    
    localStorage.setItem(key, JSON.stringify(updatedChats));
    
    // Trigger the storage event to update other components
    window.dispatchEvent(new Event('storage'));
    
    if (onTitleUpdated) {
      onTitleUpdated();
    }
    
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="p-1">
          <SquarePen className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Chat Title</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter chat title"
            className="col-span-3"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 