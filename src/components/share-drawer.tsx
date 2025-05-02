"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Share2, Facebook, Twitter, Instagram, MessageCircle, Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export function ShareDrawer() {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const params = useParams();
  const chatId = params?.id as string;

  // useEffect(() => {
    // Check if the chat is already shared
  //   const checkIfShared = async () => {
  //     if (!chatId) return;
      
  //     try {
  //       const response = await fetch(`/api/chat/${chatId}`);
  //       if (response.ok) {
  //         const data = await response.json();
  //         setIsShared(!!data.shareId);
  //         if (data.shareId) {
  //           const baseUrl = window.location.origin;
  //           setShareUrl(`${baseUrl}/shared/${data.shareId}`);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error checking share status:", error);
  //     }
  //   };

  //   checkIfShared();
  // }, [chatId]);

  const handleShare = async () => {
    if (!chatId) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/chat/${chatId}/share`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to share chat");
      }
      
      const data = await response.json();
      setShareUrl(data.shareUrl);
      setIsShared(true);
      toast.success("Chat shared successfully!");
    } catch (error) {
      console.error("Error sharing chat:", error);
      toast.error("Failed to share chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSharing = async () => {
    if (!chatId) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/chat/${chatId}/share`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove sharing");
      }
      
      setIsShared(false);
      setShareUrl("");
      toast.success("Sharing removed successfully!");
    } catch (error) {
      console.error("Error removing sharing:", error);
      toast.error("Failed to remove sharing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link disalin!");
      
      // Reset copied state after 3 seconds
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Gagal menyalin link");
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DrawerTrigger>

      <DrawerContent className="mx-auto my-4 w-full max-w-sm rounded-t-2xl bg-white dark:bg-[#1f2937]">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-lg font-semibold">Share Chat</DrawerTitle>
        </DrawerHeader>

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-gray-700 my-2" />

        {/* Share Toggle */}
        <div className="px-4 py-2">
          {isShared ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This chat is publicly shared. Anyone with the link can view it.
              </p>
              
              {/* Copy Link Button */}
              <Button
                onClick={handleCopyLink}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Tersalin!" : "Salin Link"}
              </Button>
              
              {/* Remove Sharing Button */}
              <Button
                onClick={handleRemoveSharing}
                variant="destructive"
                size="sm"
                className="mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Remove Sharing
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This chat is not shared yet. Create a public link to share it.
              </p>
              
              <Button
                onClick={handleShare}
                variant="default"
                className="mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                Create Share Link
              </Button>
            </div>
          )}
        </div>

        {isShared && (
          <>
            {/* Divider */}
            <div className="border-t border-gray-300 dark:border-gray-700 my-4" />

            {/* Social Media Buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <Link href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`} target="_blank">
                <Button variant="outline" size="icon" className="flex flex-col w-16 h-16">
                  <MessageCircle className="h-6 w-6 text-green-500" />
                  <span className="text-[10px] mt-1">WhatsApp</span>
                </Button>
              </Link>

              <Link href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank">
                <Button variant="outline" size="icon" className="flex flex-col w-16 h-16">
                  <Twitter className="h-6 w-6 text-blue-400" />
                  <span className="text-[10px] mt-1">Twitter</span>
                </Button>
              </Link>

              <Link href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank">
                <Button variant="outline" size="icon" className="flex flex-col w-16 h-16">
                  <Facebook className="h-6 w-6 text-blue-600" />
                  <span className="text-[10px] mt-1">Facebook</span>
                </Button>
              </Link>

              <Button variant="outline" size="icon" className="flex flex-col w-16 h-16" disabled>
                <Instagram className="h-6 w-6 text-pink-500" />
                <span className="text-[10px] mt-1">Instagram</span>
              </Button>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
