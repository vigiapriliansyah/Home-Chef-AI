import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Get current user to check for existing image
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { image: true }
    });

    // Delete previous image if exists
    if (currentUser?.image && currentUser.image.startsWith('/uploads/')) {
      const oldImagePath = path.join(process.cwd(), 'public', currentUser.image);
      try {
        await unlink(oldImagePath);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    // Create unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${session.user.email}-${Date.now()}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));

    // Create URL for the image
    const imageUrl = `/uploads/${fileName}`;

    // Update user profile in database with image URL
    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl },
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
