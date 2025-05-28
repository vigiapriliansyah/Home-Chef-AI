import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { z } from "zod";

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(4, "OTP must be 4 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = verifyOtpSchema.parse(body);

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code: otp,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    const resetToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expiresAt,
      },
    });

    return NextResponse.json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
