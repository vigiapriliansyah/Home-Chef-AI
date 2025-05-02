import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/share/[shareId] - Get a shared chat by share ID
export async function GET(
  req: NextRequest,
  context: { params: { shareId: string } }
) {
  try {
    // Get shareId from params and await it properly
    const params = await context.params;
    const shareId = params.shareId;
    
    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    // Find the chat by its share ID
    const chat = await prisma.channel.findFirst({
      where: {
        shareId,
        isShared: true
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Shared chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error fetching shared chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared chat" },
      { status: 500 }
    );
  }
} 