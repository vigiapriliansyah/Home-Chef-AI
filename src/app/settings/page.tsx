"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Mail, Phone, Calendar, User, KeyRound } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-2xl px-4 sm:px-6 md:px-8 mx-auto text-foreground">
      {/* Avatar + Title */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-4xl font-bold shadow-md">
          <Image
            src={session?.user?.image || "/profile.png"}
            alt="profile"
            width={110}
            height={100}
            className="rounded-full"
          />
        </div>
        <h1 className="text-2xl font-bold text-pink-500 dark:text-pink-300 mt-4">
          Personal Info
        </h1>
      </div>

      {/* Form */}
      <form className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="text-sm font-medium block mb-1">
            Your Name :
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              defaultValue={session?.user?.name}
              className="pl-9 dark:bg-[#1e293b]"
              disabled
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="text-sm font-medium block mb-1">
            Your Password :
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              defaultValue="12345678"
              className="pl-9 dark:bg-[#1e293b]"
            />
            <Eye className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" />
          </div>
          <Button
            variant="link"
            size="sm"
            className="pl-0 text-sm text-muted-foreground"
          >
            Change Your Password
          </Button>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="text-sm font-medium block mb-1">
            Your Email :
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              defaultValue={session?.user?.email}
              className="pl-9 dark:bg-[#1e293b]"
              disabled
            />
          </div>
        </div>
      </form>
    </div>
  );
}
