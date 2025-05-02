import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { nanoid } from "nanoid";

// POST /api/share - Share a chat
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    // Check if the chat exists and belongs to the user
    const chat = await prisma.channel.findFirst({
      where: {
        id: chatId,
        userId: session.user.id
      }
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or you don't have permission to share it" },
        { status: 404 }
      );
    }

    // Generate a unique share ID if one doesn't exist
    const shareId = chat.shareId || nanoid(10);

    // Update the chat to be shared
    const updatedChat = await prisma.channel.update({
      where: {
        id: chatId
      },
      data: {
        isShared: true,
        shareId
      }
    });

    return NextResponse.json({
      success: true,
      shareId: updatedChat.shareId
    });
  } catch (error) {
    console.error("Error sharing chat:", error);
    return NextResponse.json(
      { error: "Failed to share chat" },
      { status: 500 }
    );
  }
}

// DELETE /api/share - Remove sharing from a chat
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    // Check if the chat exists and belongs to the user
    const chat = await prisma.channel.findFirst({
      where: {
        id: chatId,
        userId: session.user.id
      }
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    // Update the chat to remove sharing
    await prisma.channel.update({
      where: {
        id: chatId
      },
      data: {
        isShared: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing share from chat:", error);
    return NextResponse.json(
      { error: "Failed to remove share from chat" },
      { status: 500 }
    );
  }
} 