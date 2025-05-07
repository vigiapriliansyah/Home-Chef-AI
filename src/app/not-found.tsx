"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after 3 seconds
    const redirectTimeout = setTimeout(() => {
      router.push("/");
    }, 3000);

    // Clear timeout on component unmount
    return () => clearTimeout(redirectTimeout);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0e1627] text-white p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.jpg" 
            alt="Home Chef Logo"
            width={80}
            height={80}
            className="rounded-full"
          />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        
        <p className="text-xl mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-pink-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Redirecting to home page...</p>
        </div>
      </div>
    </div>
  );
} 