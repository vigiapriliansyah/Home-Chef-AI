"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

type RegisterFormProps = {
  onSuccess?: () => void;
};

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error)
        throw new Error("Failed to sign in after registration");

      onSuccess?.(); // 🔥 close dialog
      router.push("/");
      router.refresh();
    } catch (error: any) {
      setError(error.message || "Something went wrong");
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <form className="space-y-5 mt-4" onSubmit={handleSubmit}>
      {error && (
        <div className="text-red-600 text-sm font-medium text-center">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Full Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#b58382]"
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#b58382]"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#b58382]"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password *"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#b58382]"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#b58382] hover:bg-[#a87170] text-white py-2 rounded-full transition disabled:opacity-60"
      >
        {isLoading ? "Creating account..." : "Register"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-sm text-gray-500">Or continue with</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-[#b58382] text-white py-2 px-4 rounded-full hover:bg-[#a87170] transition"
      >
        {/* Google Logo */}
        <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
          <path
            fill="#4285F4"
            d="M533.5 278.4c0-18.1-1.5-36.1-4.8-53.4H272.1v101.2h146.6c-6.3 34-25.6 62.8-54.7 82.3v68h88.4c51.8-47.7 81.1-118.1 81.1-198.1z"
          />
          <path
            fill="#34A853"
            d="M272.1 544.3c73.6 0 135.3-24.4 180.4-66.5l-88.4-68c-24.6 16.4-56 25.9-92 25.9-70.7 0-130.7-47.7-152.1-111.6H29.8v70.2C74.5 484.6 167.8 544.3 272.1 544.3z"
          />
          <path
            fill="#FBBC05"
            d="M120 324.1c-10.4-30.1-10.4-62.8 0-92.9v-70.2H29.8c-37.7 74.3-37.7 159.1 0 233.3L120 324.1z"
          />
          <path
            fill="#EA4335"
            d="M272.1 107.7c39.9 0 75.6 13.7 103.7 40.8l77.8-77.8C407.3 24.4 345.6 0 272.1 0 167.8 0 74.5 59.7 29.8 147.9l90.2 70.2c21.4-63.9 81.4-111.6 152.1-111.6z"
          />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}
