import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  resetToken: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword, resetToken } = resetPasswordSchema.parse(body);

    // Cari reset token yang valid
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        token: resetToken,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password user dan mark token sebagai used
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { used: true }
      })
    ]);

    // Cleanup token dan OTP yang expired
    await Promise.all([
      prisma.passwordResetToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { used: true }
          ]
        }
      }),
      prisma.otpCode.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { used: true }
          ]
        }
      })
    ]);

    return NextResponse.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}