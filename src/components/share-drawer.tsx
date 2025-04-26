"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Share2, Facebook, Twitter, Instagram, MessageCircle, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function ShareDrawer() {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link disalin!");
    } catch (error) {
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
          <DrawerTitle className="text-lg font-semibold">Share</DrawerTitle>
        </DrawerHeader>

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-gray-700 my-2" />

        {/* Copy Link Button */}
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleCopyLink}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Copy className="w-4 h-4" />
            {copied ? "Tersalin!" : "Salin Link"}
          </Button>
        </div>

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
      </DrawerContent>
    </Drawer>
  );
}
