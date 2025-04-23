"use client";

import Image from "next/image";
import Link from "next/link";
import LoginDialog from "@/components/login-dialog";
import RegisterDialog from "@/components/register-dialog";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#0e1627] text-white relative overflow-hidden">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-3 shadow-sm">
        {/* Logo kiri */}
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.jpg"
            alt="Home Chef Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-lg font-bold text-white font-serif">
            Home Chef
          </span>
        </div>

        {/* Tombol kanan */}
        <div className="flex items-center space-x-4">
          <LoginDialog />
          <RegisterDialog/>
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
          <Link
            href="/chat"
            className="bg-[#b58382] hover:bg-[#c48888] text-white px-6 py-4 rounded-xl shadow-md w-72 transition"
          >
            <h3 className="font-semibold text-lg mb-1">Mulai Sekarang</h3>
            <p className="text-sm">
              Halo chef! Buat akun & login untuk mengeksplor fitur dan menemukan
              resep terbaik Anda!
            </p>
          </Link>

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
