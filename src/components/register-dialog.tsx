"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import RegisterForm from "./authForm/register/RegisterForm";

export default function RegisterDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="px-4 py-1.5 rounded-full bg-[#f2dcd4] text-black font-bold border border-gray-400 shadow-md hover:bg-[#e5c2b7] transition-all">
          Sign Up
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center font-bold">
            Register
          </DialogTitle>
        </DialogHeader>
        <RegisterForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
