import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/chat/clear - Delete all chats for the current user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First, delete all messages belonging to the user's chats
    await prisma.message.deleteMany({
      where: {
        channel: {
          userId: session.user.id
        }
      },
    });
    
    // Then delete all chats belonging to the user
    await prisma.channel.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "All chats cleared successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error clearing all chats:", error);
    return NextResponse.json(
      { error: "Failed to clear all chats", details: String(error) },
      { status: 500 }
    );
  }
} 