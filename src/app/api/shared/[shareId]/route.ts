import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/shared/[shareId] - Get a shared chat by its share ID
export async function GET(
  req: NextRequest,
  context: { params: { shareId: string } }
) {
  try {
    // Get shareId from params and await it properly
    const params = await context.params;
    const shareId = params.shareId;

    // Find the channel by shareId
    const channel = await prisma.channel.findFirst({
      where: {
        shareId,
        isShared: true,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Shared chat not found" }, { status: 404 });
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error("Error fetching shared chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared chat" },
      { status: 500 }
    );
  }
} 