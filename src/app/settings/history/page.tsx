"use client";

import { Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";

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

  const deleteItem = (id: number) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121727] transition-colors duration-300">
      <div className="container max-w-4xl px-4 sm:px-6 md:px-8 mx-auto pt-14 text-black dark:text-white">
        <h1 className="text-2xl font-semibold text-pink-500 dark:text-pink-300 mb-6">History</h1>

        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-gray-300 dark:bg-gray-800 text-black dark:text-white rounded-xl px-4 py-3 flex justify-between items-center relative overflow-hidden"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{item.text}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.date}</p>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <ChevronRight className="text-black dark:text-white" />
                <button
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <button
            className="mt-8 bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-full"
            onClick={clearAll}
          >
            Clear All History
          </button>
        )}
      </div>
    </div>
  );
}
