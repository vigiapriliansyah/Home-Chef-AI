import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { name, email } = await req.json();

    // Input validation
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Check if this user is authenticated via a third-party provider
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user has any accounts linked (third-party auth)
    const hasThirdPartyAuth = user.accounts.length > 0;

    // For third-party auth users, prevent email changes
    if (hasThirdPartyAuth && email !== user.email) {
      return NextResponse.json(
        { error: "Cannot change email for accounts authenticated via third-party providers" },
        { status: 403 }
      );
    }

    // Only update the fields that are provided and allowed to be updated
    const updateData: any = {};

    // Always allow name updates
    if (name) updateData.name = name;
    
    // Only allow email updates for non-third-party auth
    if (email && email !== user.email && !hasThirdPartyAuth) {
      // Check if the new email is already in use by another user
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 409 }
        );
      }

      updateData.email = email;
    }

    // Only perform update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      // Extract provider names for UI display
      const providers = user.accounts.map(account => account.provider);
      
      // Add timestamp to force cache refresh
      const timestamp = new Date().toISOString();
      
      return NextResponse.json(
        { 
          message: "No changes to update",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: user.emailVerified,
            hasThirdPartyAuth,
            providers,
            timestamp,
          }
        },
        { status: 200 }
      );
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        updatedAt: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    // Extract provider names for UI display
    const providers = updatedUser.accounts.map(account => account.provider);

    // Log success
    console.log("User updated successfully:", {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      updatedAt: updatedUser.updatedAt,
    });

    // Add timestamp to force cache refresh
    const timestamp = new Date().toISOString();

    return NextResponse.json(
      {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
          emailVerified: updatedUser.emailVerified,
          hasThirdPartyAuth: updatedUser.accounts.length > 0,
          providers,
          updatedAt: updatedUser.updatedAt,
          timestamp,
        },
        message: "Profile updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 