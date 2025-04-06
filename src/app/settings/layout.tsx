"use client";

import SettingSidebar from "@/components/setting-sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

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
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-72 bg-muted text-foreground border-r border-border">
        <SettingSidebar />
      </aside>
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
