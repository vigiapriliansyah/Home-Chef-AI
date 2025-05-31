import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendOtpEmail } from '@/lib/email';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    // Hapus OTP lama untuk email ini
    await prisma.otpCode.deleteMany({
      where: { email }
    });

    // Buat OTP baru
    await prisma.otpCode.create({
      data: {
        email,
        code: otp,
        expiresAt
      }
    });

    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log(`OTP for ${email}: ${otp}`); // Untuk development

    return NextResponse.json({
      message: 'OTP sent successfully',
      // Hapus ini di production:
      developmentOtp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}