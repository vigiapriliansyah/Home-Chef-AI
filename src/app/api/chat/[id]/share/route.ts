import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// POST /api/chat/[id]/share - Generate a share ID for a chat
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the channel exists and belongs to the user
    const channel = await prisma.channel.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Generate a unique share ID if it doesn't exist
    let shareId = channel.shareId;
    if (!shareId) {
      shareId = crypto.randomBytes(6).toString("hex");
      
      // Update the channel with the share ID
      await prisma.channel.update({
        where: {
          id,
        },
        data: {
          isShared: true,
          shareId,
        },
      });
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin}/shared/${shareId}`;

    return NextResponse.json({ shareId, shareUrl });
  } catch (error) {
    console.error("Error sharing chat:", error);
    return NextResponse.json(
      { error: "Failed to share chat" },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/[id]/share - Remove sharing from a chat
export async function DELETE(
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

    // Check if the channel exists and belongs to the user
    const channel = await prisma.channel.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Update the channel to remove sharing
    await prisma.channel.update({
      where: {
        id,
      },
      data: {
        isShared: false,
        shareId: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing chat sharing:", error);
    return NextResponse.json(
      { error: "Failed to remove chat sharing" },
      { status: 500 }
    );
  }
} 