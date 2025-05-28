"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown untuk resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleContinue = async () => {
    setError("");
    setLoading(true);

    try {
      if (step === 1) {
        // Step 1: Request OTP
        if (!email) {
          setError("Email is required");
          return;
        }
        
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to send OTP');
          return;
        }

        // Untuk development - tampilkan OTP di console
        if (data.developmentOtp) {
          console.log('Demo OTP:', data.developmentOtp);
          alert(`Development Mode - OTP: ${data.developmentOtp}`); // Hapus di production
        }

        setStep(2);
        setResendTimer(60); // 60 detik countdown

      } else if (step === 2) {
        // Step 2: Verify OTP
        const otpString = otp.join("");
        if (otpString.length !== 4) {
          setError("Please enter complete OTP");
          return;
        }

        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: otpString }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Invalid OTP');
          return;
        }

        setResetToken(data.resetToken);
        setStep(3);

      } else if (step === 3) {
        // Step 3: Reset Password
        if (!newPassword || !confirmPassword) {
          setError("All fields are required");
          return;
        }
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        if (newPassword.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }

        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            newPassword, 
            resetToken 
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to reset password');
          return;
        }

        // Berhasil - tutup dialog dan reset state
        alert('Password reset successfully!'); // Ganti dengan toast notification
        onOpenChange(false);
        setTimeout(() => {
          resetDialog();
        }, 300);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend OTP');
        return;
      }

      // Untuk development
      // if (data.developmentOtp) {
      //   console.log('New Demo OTP:', data.developmentOtp);
      //   alert(`Development Mode - New OTP: ${data.developmentOtp}`); // Hapus di production
      // }

      setResendTimer(60);
      setOtp(["", "", "", ""]);
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setStep(1);
    setEmail("");
    setOtp(["", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setResetToken("");
    setResendTimer(0);
  };

  const handleOtpChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    
    // Auto focus ke input berikutnya
    if (value && idx < 3) {
      const next = document.getElementById(`otp-${idx + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    // Backspace untuk kembali ke input sebelumnya
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const prev = document.getElementById(`otp-${idx - 1}`);
      if (prev) (prev as HTMLInputElement).focus();
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
            {step === 1 && "Please enter your email and we will send an OTP code to reset your password."}
            {step === 2 && "We have sent a code to your email. Enter the OTP code below to verify."}
            {step === 3 && "Create your new password. Make sure it's at least 6 characters long."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          {error && (
            <div className="text-red-500 text-sm text-center mb-2 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
          
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
                  disabled={loading}
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
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-10 h-12 text-center text-lg font-bold"
                    disabled={loading}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {resendTimer > 0 ? (
                  `You can resend code in ${resendTimer}s`
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-blue-600 hover:text-blue-800 underline"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            className="w-full bg-[#b58382] hover:bg-[#a87170] text-white disabled:opacity-50" 
            onClick={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}