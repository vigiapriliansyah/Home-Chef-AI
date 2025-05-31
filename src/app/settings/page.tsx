// File: SettingsPage.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, User, KeyRound, Loader2, Check, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id || status !== "authenticated") return;
    console.log(
      "SettingsPage: Memulai fetchUserData, session user ID:",
      session.user.id
    );
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile"); // GANTI DENGAN ENDPOINT API ANDA
      if (response.ok) {
        const data = await response.json();
        console.log("SettingsPage: Data pengguna diterima dari API:", data);
        setUserData(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setHasThirdPartyAuth(data.hasThirdPartyAuth || false);
        if (data.image && !previewImage) {
          setPreviewImage(data.image);
        }
        setIsDataLoaded(true);
      } else {
        console.error(
          "SettingsPage: Gagal mengambil data pengguna, status:",
          response.status
        );
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Gagal memuat data profil.");
      }
    } catch (error) {
      console.error("SettingsPage: Error saat mengambil data pengguna:", error);
      toast.error("Terjadi kesalahan saat memuat data profil.");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, status, previewImage]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id && !isDataLoaded) {
      fetchUserData();
    }
    if (session && !isDataLoaded) {
      setName(session.user?.name || "");
      setEmail(session.user?.email || "");
      if (session.user?.image && !previewImage) {
        setPreviewImage(session.user.image);
      }
    }
  }, [session, status, isDataLoaded, fetchUserData, previewImage]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccessful(false);
    try {
      const payload = {
        name,
        email: hasThirdPartyAuth ? userData?.email : email,
      };
      console.log(
        "SettingsPage: Mengirim update profil dengan payload:",
        payload
      );
      const response = await fetch("/api/user/update", {
        // GANTI DENGAN ENDPOINT API ANDA
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json(); // Mengganti nama variabel dari 'data' ke 'responseData'
      console.log(
        "SettingsPage: Respons dari API update profil:",
        responseData
      );
      if (!response.ok)
        throw new Error(responseData.error || "Gagal memperbarui profil");

      const updatedUserFromAPI = responseData.user; // Menggunakan responseData.user
      console.log(
        "SettingsPage: User data dari API setelah update:",
        updatedUserFromAPI
      );
      const sessionBeforeUpdateString = session
        ? JSON.stringify(session)
        : "null";
      console.log(
        "SettingsPage: Sesi SAAT INI SEBELUM update:",
        JSON.parse(sessionBeforeUpdateString)
      );

      const newSessionData = {
        ...session,
        user: {
          ...session?.user,
          name: updatedUserFromAPI.name,
          email: updatedUserFromAPI.email,
          // PERBAIKAN: Memastikan 'image' dari API juga disertakan
          image:
            updatedUserFromAPI.image !== undefined
              ? updatedUserFromAPI.image
              : session?.user?.image,
        },
      };
      const newSessionDataString = JSON.stringify(newSessionData);
      console.log(
        "SettingsPage: Data yang DIKIRIM ke updateSession:",
        JSON.parse(newSessionDataString)
      );

      await updateSession(newSessionData);
      console.log(
        "SettingsPage: Panggilan updateSession selesai. Periksa konsol di sidebar untuk melihat sesi yang diperbarui."
      );

      // Update local state userData juga dengan image jika ada dari API
      setUserData((prev: any) => ({
        ...prev,
        name: updatedUserFromAPI.name,
        email: updatedUserFromAPI.email,
        image:
          updatedUserFromAPI.image !== undefined
            ? updatedUserFromAPI.image
            : prev.image,
      }));

      setIsSuccessful(true);
      toast.success("Profil berhasil diperbarui");

      // Tidak memanggil fetchUserData() lagi di sini untuk menghindari re-render berlebih jika tidak perlu,
      // karena sesi sudah diupdate dan userData lokal juga sudah diupdate.
      // Pemanggilan fetchUserData() setelah updateSession bisa menyebabkan race condition atau data yang tidak konsisten sesaat.
    } catch (error: any) {
      console.error("SettingsPage: Error saat memperbarui profil:", error);
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
      // Hanya reset isSuccessful jika sebelumnya true untuk menghindari reset yang tidak perlu
      // if (isSuccessful) { // Ini bisa menyebabkan isSuccessful tidak direset jika error terjadi setelahnya
      //    setTimeout(() => setIsSuccessful(false), 3000);
      // }
      // Cara yang lebih aman untuk mereset isSuccessful:
      // setTimeout(() => setIsSuccessful(false), 3000); // Ini akan selalu mereset setelah 3 detik
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      console.log("SettingsPage: Mengunggah gambar profil...");
      const response = await fetch("/api/user/upload-profile", {
        method: "POST",
        body: formData,
      }); // GANTI DENGAN ENDPOINT API ANDA
      const responseData = await response.json();
      console.log(
        "SettingsPage: Respons dari API unggah gambar:",
        responseData
      );
      if (!response.ok)
        throw new Error(responseData.error || "Gagal mengunggah gambar");

      const newImageUrl = responseData.imageUrl;
      console.log("SettingsPage: URL gambar baru dari API:", newImageUrl);
      const sessionBeforeUpdateString = session
        ? JSON.stringify(session)
        : "null";
      console.log(
        "SettingsPage: Sesi SAAT INI SEBELUM update gambar:",
        JSON.parse(sessionBeforeUpdateString)
      );

      const newSessionImageData = {
        ...session,
        user: {
          ...session?.user,
          image: newImageUrl,
        },
      };
      const newSessionImageDataString = JSON.stringify(newSessionImageData);
      console.log(
        "SettingsPage: Data yang DIKIRIM ke updateSession untuk gambar:",
        JSON.parse(newSessionImageDataString)
      );

      await updateSession(newSessionImageData);
      console.log(
        "SettingsPage: Panggilan updateSession untuk gambar selesai. Periksa konsol di sidebar."
      );

      setUserData((prev: any) => ({ ...prev, image: newImageUrl }));
      toast.success("Foto profil berhasil diperbarui");
    } catch (error: any) {
      console.error("SettingsPage: Error saat mengunggah gambar:", error);
      toast.error(error.message || "Gagal mengunggah foto profil");
      setPreviewImage(
        userData?.image || session?.user?.image || "/profile.png"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Kata sandi baru tidak cocok");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Kata sandi minimal 6 karakter");
      return;
    }
    setIsPasswordChanging(true);
    try {
      const response = await fetch("/api/user/change-password", {
        // GANTI DENGAN ENDPOINT API ANDA
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Gagal mengubah kata sandi");
      toast.success("Kata sandi berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const isProfileSaveDisabled =
    isLoading ||
    (name === (userData?.name || session?.user?.name) &&
      email === (userData?.email || session?.user?.email) &&
      !hasThirdPartyAuth) ||
    (hasThirdPartyAuth && name === (userData?.name || session?.user?.name));

  if (status === "loading" || (status === "authenticated" && !isDataLoaded)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-xl mb-4">
          Silakan login untuk mengakses pengaturan.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl px-4 sm:px-6 md:px-8 mx-auto text-foreground">
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-4xl font-bold shadow-md overflow-hidden">
            <Image
              key={
                previewImage ||
                userData?.image ||
                session?.user?.image ||
                "profile-settings"
              }
              src={
                previewImage ||
                userData?.image ||
                session?.user?.image ||
                "/profile.png"
              }
              alt="profile"
              width={110}
              height={100}
              className="rounded-full object-cover w-full h-full"
              priority
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
              Akun Anda terhubung dengan{" "}
              {userData?.providers?.join(", ") || "penyedia pihak ketiga"}.
            </p>
            <p>Email dan beberapa detail akun tidak dapat diubah.</p>
          </div>
        )}
      </div>
      <form className="space-y-5 mb-8" onSubmit={handleProfileUpdate}>
        <div>
          <label htmlFor="name" className="text-sm font-medium block mb-1">
            Nama Anda:
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9 dark:bg-[#1e293b]"
              disabled={hasThirdPartyAuth || isLoading}
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium block mb-1">
            Email Anda:
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 dark:bg-[#1e293b]"
              disabled={hasThirdPartyAuth || isLoading}
            />
          </div>
          {hasThirdPartyAuth && (
            <p className="text-xs text-muted-foreground mt-1">
              Email tidak dapat diubah untuk akun yang terhubung dengan penyedia
              pihak ketiga.
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isProfileSaveDisabled || isLoading}
        >
          {isLoading && !isPasswordChanging && !isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memperbarui...
            </>
          ) : isSuccessful ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Diperbarui!
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </form>
      {!hasThirdPartyAuth && (
        <>
          <div className="border-t border-border pt-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Ubah Kata Sandi</h2>
            <form className="space-y-4" onSubmit={handlePasswordChange}>
              <div>
                <label
                  htmlFor="current-password"
                  className="text-sm font-medium block mb-1"
                >
                  Kata Sandi Saat Ini:
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
                    disabled={isPasswordChanging}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="text-sm font-medium block mb-1"
                >
                  Kata Sandi Baru:
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
                    disabled={isPasswordChanging}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium block mb-1"
                >
                  Konfirmasi Kata Sandi Baru:
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
                    disabled={isPasswordChanging}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                variant="outline"
                disabled={
                  isPasswordChanging ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {isPasswordChanging ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengubah Kata Sandi...
                  </>
                ) : (
                  "Ubah Kata Sandi"
                )}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
