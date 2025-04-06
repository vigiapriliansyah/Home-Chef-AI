"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Mail, Phone, Calendar } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-[#111627] p-8 rounded-2xl shadow-lg text-foreground">
      <h1 className="text-2xl font-bold text-pink-500 dark:text-pink-300 mb-6">
        Personal Info
      </h1>

      <form className="space-y-5 relative z-10">
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Your Name
          </label>
          <Input id="name" defaultValue="Susi Susanti" />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Your Password
          </label>
          <div className="relative">
            <Input id="password" type="password" defaultValue="12345678" />
            <Eye className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm">
            Change Your Password
          </Button>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Your Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              defaultValue="hello@homechefsusi.com"
              className="pl-9"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="phone" defaultValue="082157628934" className="pl-9" />
          </div>
        </div>

        {/* Birthday Date */}
        <div className="space-y-2">
          <label htmlFor="birthday" className="text-sm font-medium">
            Birthday Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="birthday"
              type="date"
              defaultValue="2003-12-12"
              className="pl-9"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
