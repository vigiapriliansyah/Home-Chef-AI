"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut } from "lucide-react";

export function AuthStatus() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400"
      >
        <LogOut size={16} />
        Logout
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <p>Not signed in</p>
      <Link
        href="/auth/signin"
        className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Sign in
      </Link>
    </div>
  );
}
