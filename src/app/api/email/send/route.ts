import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail, verifyTransporter } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, name, url, otp } = body;

    if (!to) {
      return NextResponse.json({ error: 'Email address (to) is required' }, { status: 400 });
    }

    // First verify SMTP connection
    const connected = await verifyTransporter();
    if (!connected) {
      return NextResponse.json(
        { error: 'SMTP connection failed. Check your SMTP_HOST, SMTP_USER, and SMTP_PASS in .env.local' },
        { status: 500 }
      );
    }

    const recipientName = name || 'User';

    switch (type) {
      case 'welcome':
        await sendWelcomeEmail(to, recipientName);
        return NextResponse.json({ success: true, message: `Welcome email sent to ${to}` });

      case 'verification':
        await sendVerificationEmail(to, recipientName, url || 'https://uplanapp.vercel.app/verify');
        return NextResponse.json({ success: true, message: `Verification email sent to ${to}` });

      case 'password-reset':
        await sendPasswordResetEmail(to, recipientName, url || 'https://uplanapp.vercel.app/reset-password');
        return NextResponse.json({ success: true, message: `Password reset email sent to ${to}` });

      case 'test':
        // Send a simple test email
        await sendWelcomeEmail(to, recipientName);
        return NextResponse.json({ success: true, message: `Test welcome email sent to ${to}` });

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: welcome, verification, password-reset, or test' },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: `Failed to send email: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const connected = await verifyTransporter();
    return NextResponse.json({
      status: connected ? 'connected' : 'disconnected',
      smtp_host: process.env.SMTP_HOST || 'not set',
      smtp_user: process.env.SMTP_USER ? '***configured***' : 'not set',
      smtp_pass: process.env.SMTP_PASS ? '***configured***' : 'not set',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ status: 'error', error: errorMessage }, { status: 500 });
  }
}
