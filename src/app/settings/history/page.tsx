"use client";

import { Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/delete-chat-dialog"; // Pastikan path import sesuai

interface ChatItem {
  id: number;
  text: string;
  date: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ChatItem[]>([
    {
      id: 1,
      text: "Desert dengan bahan utama coklat yang mudah di buat.",
      date: "hari ini.",
    },
    {
      id: 2,
      text: "Saya punya ayam, cabai dan kecap menu apa yang bisa saya masak dengan bahan tersebut?",
      date: "7 hari lalu.",
    },
    {
      id: 3,
      text: "Cara membuat kolak pisang mudah dan enak.",
      date: "30 hari lalu.",
    },
  ]);

  const [openedId, setOpenedId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmClearAllOpen, setConfirmClearAllOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const toggleOpen = (id: number) => {
    setOpenedId((prev) => (prev === id ? null : id));
  };

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (selectedId !== null) {
      setHistory((prev) => prev.filter((item) => item.id !== selectedId));
    }
    setConfirmOpen(false);
    setSelectedId(null);
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setSelectedId(null);
  };

  const handleClearAllClick = () => {
    setConfirmClearAllOpen(true);
  };

  const confirmClearAll = () => {
    setHistory([]);
    setConfirmClearAllOpen(false);
  };

  const cancelClearAll = () => {
    setConfirmClearAllOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121727] transition-colors duration-300">
      <div className="container max-w-4xl px-4 sm:px-6 md:px-8 mx-auto pt-14 text-black dark:text-white">
        <h1 className="text-2xl font-semibold text-pink-500 dark:text-pink-300 mb-6">
          History
        </h1>

        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-xl">
              {/* Tombol Delete */}
              <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md"
                  onClick={() => handleDeleteClick(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Item Chat */}
              <div
                className={`bg-gray-300 dark:bg-gray-800 text-black dark:text-white px-4 py-3 flex justify-between items-center transform transition-transform duration-300 ${
                  openedId === item.id ? "-translate-x-20" : "translate-x-0"
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.text}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {item.date}
                  </p>
                </div>

                <button onClick={() => toggleOpen(item.id)}>
                  <ChevronRight className="text-black dark:text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <button
            className="mt-8 bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-full"
            onClick={handleClearAllClick}
          >
            Clear All History
          </button>
        )}
      </div>

      {/* Dialog Konfirmasi Hapus 1 item */}
      <ConfirmDialog
        open={confirmOpen}
        title="Hapus Riwayat Ini?"
        description="Apakah kamu yakin ingin menghapus riwayat ini?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Dialog Konfirmasi Hapus Semua */}
      <ConfirmDialog
        open={confirmClearAllOpen}
        title="Hapus Semua Riwayat?"
        description="Semua riwayat akan dihapus dan tidak bisa dikembalikan. Lanjutkan?"
        onConfirm={confirmClearAll}
        onCancel={cancelClearAll}
      />
    </div>
  );
}
