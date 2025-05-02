"use client";

import Image from "next/image";
import Link from "next/link";
import LoginDialog from "@/components/login-dialog";
import RegisterDialog from "@/components/register-dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If user is already authenticated, redirect to chat
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/chat");
    }
  }, [status, router]);

  return (
    <main className="min-h-screen flex flex-col bg-[#0e1627] text-white relative overflow-hidden">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/logo.jpg"
            alt="Home Chef Logo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="text-lg font-bold text-white font-serif">
            Home Chef
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {status === "unauthenticated" && (
            <>
              <LoginDialog />
              <RegisterDialog />
            </>
          )}
          {status === "authenticated" && (
            <p className="text-sm">Redirecting to chat...</p>
          )}
        </div>
      </header>

      {/* Content */}
      <section className="flex flex-col items-center justify-center flex-grow text-center px-4 py-12 relative">
        {/* Background logo */}
        <Image
          src="/logobnw.png"
          alt="Logo Background"
          width={300}
          height={300}
          className="absolute opacity-10"
        />

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
          Selamat Datang di Home Chef 👋
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          Temukan Resep Lezat dengan AI !
        </p>

        {/* Cards */}
        <div className="flex flex-col md:flex-row gap-6 z-10">
          <div
            className="bg-[#b58382] hover:bg-[#c48888] text-white px-6 py-4 rounded-xl shadow-md w-72 transition"
          >
            <h3 className="font-semibold text-lg mb-1">Mulai Sekarang</h3>
            <p className="text-sm">
              Halo chef! Buat akun & login untuk mengeksplor fitur dan menemukan
              resep terbaik Anda!
            </p>
          </div>

          <div className="bg-white text-black px-6 py-4 rounded-xl shadow-md w-72">
            <h3 className="font-semibold text-lg mb-1">Home Chef App</h3>
            <p className="text-sm">
              Aplikasi Chef berbasis AI yang membantu Anda menemukan dan membuat
              resep masakan dengan mudah. Cukup tanyakan dan AI akan memberikan
              rekomendasi resep sesuai selera Anda!
            </p>
          </div>
        </div>
      </section>

      {/* Sayur di bawah */}
      <div className="w-full">
        <Image
          src="/sayur.png"
          alt="Sayuran"
          width={1100}
          height={100}
          className="w-full object-contain"
        />
      </div>
    </main>
  );
}
