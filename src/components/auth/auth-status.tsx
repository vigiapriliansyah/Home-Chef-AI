"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { LogOut } from "lucide-react";
export function AuthStatus() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        {/* <p>
          Signed in as <span className="font-medium">{session.user.email}</span>
        </p> */}
        <DropdownMenuItem
          onClick={() => signOut()}
          className="rounded py-1.5 text-sm font-medium text-white w-full"
        >
          <LogOut />
          Log Out
        </DropdownMenuItem>
      </div>
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
