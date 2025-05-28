import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendOtpEmail } from '@/lib/email';

const resendOtpSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resendOtpSchema.parse(body);

    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Rate limiting - cek OTP yang baru dibuat (dalam 1 menit terakhir)
    const recentOtp = await prisma.otpCode.findFirst({
      where: {
        email,
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000) // 1 menit yang lalu
        }
      }
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: 'Please wait before requesting another OTP' },
        { status: 429 }
      );
    }

    // Generate OTP baru
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    // Hapus OTP lama dan buat yang baru
    await prisma.otpCode.deleteMany({
      where: { email }
    });

    await prisma.otpCode.create({
      data: {
        email,
        code: otp,
        expiresAt
      }
    });

    // Kirim email (uncomment jika sudah setup email)
    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log(`New OTP for ${email}: ${otp}`); // Untuk development

    return NextResponse.json({
      message: 'New OTP sent successfully',
      developmentOtp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}