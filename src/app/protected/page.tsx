import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  console.log("session", session);
  
  // This check is redundant with middleware, but it's a good practice
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full space-y-8 p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center">Protected Page</h1>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <p>You are authenticated!</p>
          <p className="mt-2">
            Logged in as: <span className="font-medium">{session.user.email}</span>
          </p>
        </div>
        <div className="flex justify-center mt-4">
          <Link
            href="/"
            className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 