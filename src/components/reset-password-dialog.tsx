"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResetPasswordDialog({ open, onOpenChange }: ResetPasswordDialogProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleContinue = () => {
    setError("");
    if (step === 1) {
      if (!email) {
        setError("Email is required");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (otp.some((v) => v === "")) {
        setError("OTP is required");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!newPassword || !confirmPassword) {
        setError("All fields are required");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      // Dummy success, close dialog
      onOpenChange(false);
      setTimeout(() => {
        setStep(1);
        setEmail("");
        setOtp(["", "", "", ""]);
        setNewPassword("");
        setConfirmPassword("");
        setError("");
      }, 300);
    }
  };

  const handleOtpChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    // Auto focus next
    if (value && idx < 3) {
      const next = document.getElementById(`otp-${idx + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {step === 1 && "Reset your password 🔑"}
            {step === 2 && "OTP code verification 📨"}
            {step === 3 && "Create New Password 🔒"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 1 && "Please enter your email and we will send a OTP code to reset your password."}
            {step === 2 && "We have sent a code to your email. Enter the OTP code below to verify."}
            {step === 3 && "Create your new password. If you forget it then you have to do the process again."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}
          {step === 1 && (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2 justify-center">
                {otp.map((v, i) => (
                  <Input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={v}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-10 h-12 text-center text-lg font-bold"
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">You can resend code in 51 s</div>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button className="w-full bg-[#b58382] hover:bg-[#a87170] text-white" onClick={handleContinue}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
