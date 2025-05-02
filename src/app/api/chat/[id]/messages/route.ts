import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/[id]/messages - Get messages for a specific chat
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Get id from params and await it properly
    const params = await context.params;
    const id = params.id;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if the chat exists and user has access
    const chat = await prisma.channel.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { isShared: true }
        ]
      }
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or you don't have access" },
        { status: 404 }
      );
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        channelId: id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/chat/[id]/messages - Add a message to a chat
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Get id from params and await it properly
    const params = await context.params;
    const id = params.id;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { content, role } = await req.json();

    // Validate input
    if (!content || !role || !["user", "assistant"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid message data" },
        { status: 400 }
      );
    }

    // Check if the chat exists and user has access
    let chat = await prisma.channel.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { isShared: true }
        ]
      }
    });

    // If chat not found and user is authenticated, create a new chat
    if (!chat && session.user?.id) {
      chat = await prisma.channel.create({
        data: {
          id,
          name: "Percakapan Baru",
          userId: session.user.id,
        },
      });
    }
    
    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or you don't have access" },
        { status: 404 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        role,
        channelId: id,
        userId: role === "user" ? session.user.id : undefined
      } as any
    });

    // Update the chat's updatedAt timestamp
    await prisma.channel.update({
      where: {
        id
      },
      data: {
        updatedAt: new Date()
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
} 