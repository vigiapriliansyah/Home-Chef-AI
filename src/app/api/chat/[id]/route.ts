import { NextRequest, NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/chat/[id] - Get a specific chat with its messages
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to find the existing chat
    let chat = await prisma.channel.findFirst({
      where: {
        id,
        OR: [{ userId: session.user.id }, { isShared: true }],
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // If chat not found and user is authenticated, create a new chat
    if (!chat && session.user?.id) {
      chat = await prisma.channel.create({
        data: {
          id,
          name: "Percakapan Baru",
          userId: session.user.id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
      
      return NextResponse.json(chat);
    }

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

// PATCH /api/chat/[id] - Update a chat
export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Get id from params and await it properly
    const params = await context.params;
    const id = params.id;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, isShared } = await req.json();

    // Check if the chat belongs to the user
    const existingChat = await prisma.channel.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingChat) {
      return NextResponse.json(
        { error: "Chat not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    // Update only the provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (isShared !== undefined) updateData.isShared = isShared;

    const updatedChat = await prisma.channel.update({
      where: {
        id,
      },
      data: updateData,
    });

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/[id] - Delete a chat
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    // Get id from params and await it properly
    const params = await context.params;
    const id = params.id;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the chat belongs to the user
    const existingChat = await prisma.channel.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingChat) {
      return NextResponse.json(
        { error: "Chat not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Delete the chat and all associated messages
    await prisma.message.deleteMany({
      where: {
        channelId: id,
      },
    });

    await prisma.channel.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
