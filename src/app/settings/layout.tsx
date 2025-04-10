"use client";

import SettingSidebar from "@/components/setting-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SidebarIcon } from "lucide-react";
import Link from "next/link";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Loading state
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  // Redirect jika belum login
  if (!session) {
    router.push("/api/auth/signin");
    return null;
  }

  return (
    <SidebarProvider>
      <SettingSidebar />
      <SidebarInset>
        {/* Tombol Toggle Sidebar */}
        <ToggleSidebarButton />

        <main className="main-bg">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Komponen tombol toggle
function ToggleSidebarButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex items-center gap-4 px-4 py-2">
      <Button
        className="h-8 w-8"
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
      >
        <SidebarIcon />
      </Button>

      <Link href="/chat">
        <Button variant="outline" className="flex items-center gap-2 h-8">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </Link>
    </div>

  );
}
