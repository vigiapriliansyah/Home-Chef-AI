"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Mail,
  User,
  KeyRound,
  Loader2,
  Check,
  Upload,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, update: updateSession, status } = useSession();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [hasThirdPartyAuth, setHasThirdPartyAuth] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Fetch user data from the database
  const fetchUserData = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();

        // Store complete user data
        setUserData(data);

        // Update form fields
        setName(data.name || "");
        setEmail(data.email || "");

        // Set third-party auth status
        setHasThirdPartyAuth(data.hasThirdPartyAuth);

        // Mark data as loaded
        setIsDataLoaded(true);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data when session is available
  useEffect(() => {
    if (session?.user?.id && !isDataLoaded) {
      fetchUserData();
    }
  }, [session, isDataLoaded, fetchUserData]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccessful(false);

    // try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email: hasThirdPartyAuth ? userData?.email : email, // Only send email if not third-party auth
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Get the updated user data from the response
      const { user } = data;

      // Update local state with new data
      setUserData({
        ...userData,
        name: user.name,
        email: user.email,
      });
      console.log("user",user);
      
      // Update session for UI consistency
      await updateSession({
        user: {
          name: user.name,
          email: user.email,
        },
      });

      setIsSuccessful(true);
      toast.success("Profile updated successfully");

      // Refresh user data
      fetchUserData();
    // } catch (error: any) {
    //   toast.error(error.message || "Something went wrong");
    // } finally {
    //   setIsLoading(false);
    //   // Reset success indicator after a delay
    //   setTimeout(() => setIsSuccessful(false), 3000);
    // }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsPasswordChanging(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast.success("Password changed successfully");

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/user/upload-profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      // Update user data with new image URL
      setUserData(prev => ({
        ...prev,
        image: data.imageUrl
      }));

      // Update session
      await updateSession({
        user: {
          ...session?.user,
          image: data.imageUrl
        }
      });

      toast.success('Profile photo updated successfully');
    } catch (error) {
      toast.error('Failed to upload profile photo');
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Determine if we should disable the save button
  const isSaveDisabled =
    isLoading ||
    hasThirdPartyAuth ||
    (!hasThirdPartyAuth &&
      name === userData?.name &&
      email === userData?.email);

  // Show loading state while session is loading
  if (status === "loading" || !isDataLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl px-4 sm:px-6 md:px-8 mx-auto text-foreground">
      {/* Avatar + Title */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-4xl font-bold shadow-md overflow-hidden">
            <Image
              src={previewImage || userData?.image || "/profile.png"}
              alt="profile"
              width={110}
              height={100}
              className="rounded-full object-cover w-full h-full"
            />
          </div>
          <label 
            htmlFor="profile-upload" 
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
          >
            <Upload className="h-6 w-6 text-white" />
          </label>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </div>
        {isUploading && (
          <div className="mt-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-pink-500 dark:text-pink-300 mt-4">
          Personal Info
        </h1>
        {hasThirdPartyAuth && (
          <div className="text-sm text-muted-foreground mt-2 text-center max-w-md">
            <p>
              Your account is linked to{" "}
              {userData?.providers?.join(", ") || "a third-party provider"}.
            </p>
            <p>Email and some account details cannot be modified.</p>
          </div>
        )}
      </div>
      <form className="space-y-5 mb-8" onSubmit={handleProfileUpdate}>
        {/* Name */}
        <div>
          <label htmlFor="name" className="text-sm font-medium block mb-1">
            Your Name:
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9 dark:bg-[#1e293b]"
              disabled={hasThirdPartyAuth}

            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="text-sm font-medium block mb-1">
            Your Email:
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 dark:bg-[#1e293b]"
              disabled={hasThirdPartyAuth}
            />
          </div>
          {hasThirdPartyAuth && (
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed for accounts linked to third-party
              providers
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isSaveDisabled}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : isSuccessful ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Updated!
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>

      {/* Password Change Form - Only for non-third-party auth users */}
      {!hasThirdPartyAuth && (
        <>
          <div className="border-t border-border pt-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form className="space-y-4" onSubmit={handlePasswordChange}>
              {/* Current Password */}
              <div>
                <label
                  htmlFor="current-password"
                  className="text-sm font-medium block mb-1"
                >
                  Current Password:
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-9 dark:bg-[#1e293b]"
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="text-sm font-medium block mb-1"
                >
                  New Password:
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 dark:bg-[#1e293b]"
                    required
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium block mb-1"
                >
                  Confirm New Password:
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 dark:bg-[#1e293b]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="outline"
                disabled={isPasswordChanging}
              >
                {isPasswordChanging ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
