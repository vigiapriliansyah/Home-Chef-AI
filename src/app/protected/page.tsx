import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  
  // This check is redundant with middleware, but it's a good practice
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full space-y-8 p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center">Protected Page</h1>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <p className="font-bold">You are authenticated!</p>
          <div className="mt-4 flex flex-col items-center">
            {session.user.image && (
              <div className="mb-4">
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
            )}
            <p className="mt-2">
              <span className="font-medium">Name:</span> {session.user.name}
            </p>
            <p className="mt-2">
              <span className="font-medium">Email:</span> {session.user.email}
            </p>
            <p className="mt-2">
              <span className="font-medium">User ID:</span> {session.user.id}
            </p>
          </div>
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