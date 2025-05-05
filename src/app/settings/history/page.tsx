"use client";

import { Trash2, ChevronRight, Loader2 } from "lucide-react"; // Import Loader2
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import useRouter if needed for redirects
import ConfirmDialog from "@/components/delete-chat-dialog"; // Pastikan path import sesuai
import { Button } from "@/components/ui/button"; // Import Button if needed for styling
import { toast } from "sonner"; // Import toast for notifications

// Interface matching the data structure from AppSidebar/API
interface ChatSession {
  id: string; // Use string ID from database
  name: string; // Chat title/name
  createdAt?: Date | string; // Date chat was created
  // Add any other relevant fields if needed
}

// Helper function to format dates (example using relative time)
const formatRelativeDate = (dateInput: Date | string | undefined): string => {
    if (!dateInput) return "Tanggal tidak diketahui";

    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays === 0) {
        if (diffHours < 1) {
            if (diffMinutes < 1) return "Baru saja";
            return `${diffMinutes} menit lalu`;
        }
        return `${diffHours} jam lalu`;
    }
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
    return `${Math.floor(diffDays / 365)} tahun lalu`;
};


export default function HistoryPage() {
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true); // State for initial loading
  const [isDeleting, setIsDeleting] = useState(false); // State for single delete loading
  const [isClearingAll, setIsClearingAll] = useState(false); // State for clear all loading
  const [error, setError] = useState<string | null>(null); // State for errors

  const [openedId, setOpenedId] = useState<string | null>(null); // Use string ID
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmClearAllOpen, setConfirmClearAllOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null); // Use string ID

  const { data: session, status } = useSession();
  const router = useRouter(); // Initialize router

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      if (status === 'loading') return; // Wait for session status to resolve
      if (!session?.user?.id) {
          setIsLoading(false);
          setError("Anda harus login untuk melihat riwayat.");
          // Optional: Redirect to login
          // router.push('/api/auth/signin');
          return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat"); // Fetch from your API endpoint
        if (!response.ok) {
          throw new Error("Gagal mengambil riwayat chat");
        }
        const data: ChatSession[] = await response.json();
        // Sort chats by creation date, newest first
        data.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Sort descending
        });
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        toast.error("Gagal memuat riwayat chat.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [session, status]); // Re-run if session or status changes

  // Toggle function to open/close the delete reveal slide
  const toggleOpen = (id: string) => {
    setOpenedId((prev) => (prev === id ? null : id));
  };

  // --- Delete Single Chat ---
  const handleDeleteClick = (id: string) => {
    // This function is triggered by the delete button revealed after sliding
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedId || !session?.user?.id) return;

    setIsDeleting(true);
    setConfirmOpen(false);

    try {
      const response = await fetch(`/api/chat/${selectedId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus chat");
      }

      setHistory((prev) => prev.filter((item) => item.id !== selectedId));
      toast.success("Riwayat chat berhasil dihapus.");
      setOpenedId(null); // Close the slide after successful delete

    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menghapus chat.");
    } finally {
      setIsDeleting(false);
      setSelectedId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setSelectedId(null);
  };

  // --- Clear All Chats ---
  const handleClearAllClick = () => {
    setConfirmClearAllOpen(true);
  };

  const confirmClearAll = async () => {
     if (!session?.user?.id) return;

     setIsClearingAll(true);
     setConfirmClearAllOpen(false);

     try {
       const response = await fetch("/api/chat/clear", {
         method: "DELETE",
       });

       if (!response.ok) {
         throw new Error("Gagal menghapus semua chat");
       }

       setHistory([]);
       toast.success("Semua riwayat chat berhasil dihapus.");

     } catch (error) {
       console.error("Error clearing all chats:", error);
       toast.error(error instanceof Error ? error.message : "Gagal menghapus semua chat.");
     } finally {
       setIsClearingAll(false);
     }
  };

  const cancelClearAll = () => {
    setConfirmClearAllOpen(false);
  };

  // --- Render Logic ---

  if (status === 'loading' || isLoading) {
      return (
          <div className="flex justify-center items-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
      );
  }

  if (error) {
      return (
          <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
              <h2 className="text-xl text-red-600 mb-4">Terjadi Kesalahan</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#121727] transition-colors duration-300">
      <div className="container max-w-4xl px-4 sm:px-6 md:px-8 mx-auto pt-14 pb-10 text-black dark:text-white">
        <h1 className="text-2xl font-semibold text-pink-500 dark:text-pink-300 mb-6">
          History
        </h1>

        {history.length === 0 ? (
             <p className="text-gray-500 dark:text-gray-400 text-center mt-10">
                 Tidak ada riwayat chat.
             </p>
        ) : (
            <>
                <div className="space-y-4">
                {history.map((item) => (
                    // Container for slide interaction
                    <div key={item.id} className="relative overflow-hidden rounded-xl bg-red-600"> {/* Added bg-red-600 for the revealed area */}

                        {/* Delete Button (Positioned absolutely on the right, revealed by sliding the content) */}
                        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-4 z-0"> {/* z-0 to be behind content */}
                            <button
                                className={`text-white p-2 rounded-md transition-opacity duration-200 ${isDeleting && selectedId === item.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                                onClick={() => !isDeleting && handleDeleteClick(item.id)}
                                disabled={isDeleting && selectedId === item.id}
                                aria-label={`Hapus chat ${item.name}`}
                            >
                                {isDeleting && selectedId === item.id ? (
                                    <Loader2 size={20} className="animate-spin" /> // Slightly larger loader
                                ) : (
                                    <Trash2 size={20} /> // Slightly larger icon
                                )}
                            </button>
                        </div>

                        {/* Sliding Content Area */}
                        <div
                            className={`relative z-10 bg-gray-100 dark:bg-gray-800 text-black dark:text-white px-4 py-3 flex justify-between items-center transform transition-transform duration-300 rounded-xl ${
                            openedId === item.id ? "-translate-x-20" : "translate-x-0" // Adjust translate value if needed (e.g., -translate-x-16 or -translate-x-24)
                            }`}
                        >
                            {/* Link and Text Content */}
                            <div className="flex-1 overflow-hidden pr-4">
                                <a href={`/chat/${item.id}`} className="block hover:underline focus:outline-none focus:ring-2 focus:ring-pink-400 rounded">
                                    <p className="text-sm font-medium truncate">
                                        {item.name || "Tanpa Judul"}
                                    </p>
                                </a>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {formatRelativeDate(item.createdAt)}
                                </p>
                            </div>

                            {/* Button to trigger slide */}
                            <button
                                onClick={() => toggleOpen(item.id)}
                                className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                aria-label={openedId === item.id ? `Sembunyikan opsi hapus untuk chat ${item.name}` : `Tampilkan opsi hapus untuk chat ${item.name}`}
                            >
                                <ChevronRight className={`text-black dark:text-white transition-transform duration-300 ${openedId === item.id ? 'rotate-180' : 'rotate-0'}`} />
                            </button>
                        </div>
                    </div>
                ))}
                </div>

                {/* Clear All Button */}
                <button
                    className={`mt-8 bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white font-semibold px-6 py-2 rounded-full flex items-center justify-center gap-2 transition-opacity duration-200 ${isClearingAll ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleClearAllClick}
                    disabled={isClearingAll}
                >
                    {isClearingAll ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Menghapus...
                        </>
                    ) : (
                        'Hapus Semua Riwayat'
                    )}
                </button>
            </>
        )}
      </div>

      {/* Dialogs remain the same */}
      <ConfirmDialog
        open={confirmOpen}
        title="Hapus Riwayat Ini?"
        description="Apakah kamu yakin ingin menghapus riwayat chat ini secara permanen?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isLoading={isDeleting}
      />
      <ConfirmDialog
        open={confirmClearAllOpen}
        title="Hapus Semua Riwayat?"
        description="Semua riwayat chat akan dihapus secara permanen dan tidak bisa dikembalikan. Lanjutkan?"
        onConfirm={confirmClearAll}
        onCancel={cancelClearAll}
        confirmText="Ya, Hapus Semua"
        cancelText="Batal"
        isLoading={isClearingAll}
      />
    </div>
  );
}