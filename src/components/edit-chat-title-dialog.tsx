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
import { SquarePen, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

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
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleSave = async () => {
    if (!session?.user?.id || !title.trim()) return;

    setIsLoading(true);

    try {
      // Update the chat title in the database
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: title.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update chat title");
      }

      toast.success("Chat title updated");
      
      if (onTitleUpdated) {
        onTitleUpdated();
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating chat title:", error);
      toast.error("Failed to update chat title");
    } finally {
      setIsLoading(false);
    }
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
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 