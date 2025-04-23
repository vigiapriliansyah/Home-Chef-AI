"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SignInForm from "./authForm/signin/SignInForm";

export default function LoginDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#b58382] text-white hover:bg-[#a87170] rounded-full px-6 py-2 shadow-md">
          Log In
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center font-bold">
            Sign In
          </DialogTitle>
        </DialogHeader>
        <SignInForm />
      </DialogContent>
    </Dialog>
  );
}
