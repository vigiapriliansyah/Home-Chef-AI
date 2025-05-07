"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatNotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to chat page after 3 seconds
    const redirectTimeout = setTimeout(() => {
      router.push("/chat");
    }, 3000);

    // Clear timeout on component unmount
    return () => clearTimeout(redirectTimeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-pink-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Chat Not Found</h1>
        
        <p className="text-lg mb-8">
          The chat you're looking for doesn't exist or has been removed.
        </p>
        
        <Button 
          onClick={() => router.push("/chat")}
          className="mb-6"
        >
          Return to Chats
        </Button>
        
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p>Redirecting to chats...</p>
        </div>
      </div>
    </div>
  );
} 