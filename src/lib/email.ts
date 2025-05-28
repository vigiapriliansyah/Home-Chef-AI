import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendOtpEmail(email: string, otp: string) {
  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password. Use the OTP code below:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #b58382; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}