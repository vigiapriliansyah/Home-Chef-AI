"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);

    // Set up automatic redirect after a longer delay (10 seconds)
    const redirectTimeout = setTimeout(() => {
      router.push("/");
    }, 10000);

    // Clear timeout on component unmount
    return () => clearTimeout(redirectTimeout);
  }, [error, router]);

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

        <h1 className="text-3xl font-bold mb-4">Something went wrong!</h1>

        <p className="text-lg mb-8">
          We're sorry, but there was an error processing your request.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-pink-300 mt-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p>Redirecting to home page in 10 seconds...</p>
        </div>
      </div>
    </div>
  );
} 