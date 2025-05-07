"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsNotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to settings page after 3 seconds
    const redirectTimeout = setTimeout(() => {
      router.push("/settings");
    }, 3000);

    // Clear timeout on component unmount
    return () => clearTimeout(redirectTimeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
            <Settings className="h-8 w-8 text-pink-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Settings Page Not Found</h1>
        
        <p className="text-lg mb-8">
          The settings page you're looking for doesn't exist.
        </p>
        
        <Button 
          onClick={() => router.push("/settings")}
          className="mb-6"
        >
          Return to Settings
        </Button>
        
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p>Redirecting to settings...</p>
        </div>
      </div>
    </div>
  );
} 