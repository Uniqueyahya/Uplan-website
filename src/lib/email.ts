import nodemailer from 'nodemailer';

// SMTP configuration — populated from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const FROM_NAME = process.env.SMTP_FROM_NAME || 'Uplan';
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '';

function getBaseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #080808; font-family: 'Inter', 'Segoe UI', Roboto, sans-serif; color: #ffffff; }
    .email-wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .email-header { text-align: center; padding-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 30px; }
    .logo { font-size: 32px; font-weight: 900; background: linear-gradient(135deg, #F05A9D, #A66CFF, #6366F1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -1px; }
    .email-body { padding: 0 10px; }
    .email-body h1 { font-size: 24px; font-weight: 800; margin-bottom: 16px; color: #ffffff; }
    .email-body p { font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.7); margin-bottom: 16px; }
    .cta-button { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #F05A9D, #A66CFF, #6366F1); color: #ffffff !important; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 15px; margin: 20px 0; }
    .cta-button:hover { opacity: 0.9; }
    .code-box { background: #141414; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 24px; text-align: center; margin: 24px 0; }
    .code-box .code { font-size: 36px; font-weight: 900; letter-spacing: 8px; background: linear-gradient(135deg, #F05A9D, #A66CFF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .email-footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; }
    .email-footer p { font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.6; }
    .highlight { color: #A66CFF; font-weight: 600; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <div class="logo">UP</div>
      <p style="font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px;">Uplan — Your Productivity Partner</p>
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      <p>© ${new Date().getFullYear()} Uplan. All rights reserved.<br/>
      You received this email because you have an account with Uplan.</p>
    </div>
  </div>
</body>
</html>`;
}

// --- Email Templates ---

export async function sendWelcomeEmail(to: string, name: string) {
  const html = getBaseTemplate(`
    <h1>Welcome to Uplan, ${name}! 🎉</h1>
    <p>We're thrilled to have you on board. Uplan is designed to help you plan, track, and crush your daily goals with ease.</p>
    <p>Here's what you can do right away:</p>
    <div style="background: #141414; border-radius: 14px; padding: 20px; margin: 20px 0; border: 1px solid rgba(255,255,255,0.08);">
      <p style="margin: 8px 0;">✅ <span class="highlight">Create tasks</span> — with optional focus timers</p>
      <p style="margin: 8px 0;">📊 <span class="highlight">Track progress</span> — see your completion trends</p>
      <p style="margin: 8px 0;">🎯 <span class="highlight">Set weekly targets</span> — and mark achievements</p>
      <p style="margin: 8px 0;">🛒 <span class="highlight">Market list</span> — organize your shopping</p>
    </div>
    <div style="text-align: center;">
      <a href="https://uplanapp.vercel.app/dashboard" class="cta-button">Go to Dashboard →</a>
    </div>
    <p style="font-size: 13px; color: rgba(255,255,255,0.4);">If you didn't create this account, please ignore this email.</p>
  `, 'Welcome to Uplan');

  return transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Welcome to Uplan — Let\'s Get Productive! 🚀',
    html,
  });
}

export async function sendVerificationEmail(to: string, name: string, verificationUrl: string) {
  const html = getBaseTemplate(`
    <h1>Verify Your Email</h1>
    <p>Hey ${name}, thanks for signing up! Please verify your email address to activate your Uplan account.</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="cta-button">Verify Email Address</a>
    </div>
    <p style="font-size: 13px; color: rgba(255,255,255,0.4);">Or copy and paste this URL into your browser:</p>
    <p style="font-size: 12px; word-break: break-all; color: #A66CFF;">${verificationUrl}</p>
    <p style="font-size: 13px; color: rgba(255,255,255,0.4);">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
  `, 'Verify Your Email — Uplan');

  return transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: 'Verify Your Uplan Email Address ✅',
    html,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const uniqueTag = Math.floor(1000 + Math.random() * 9000);

  const html = getBaseTemplate(`
    <h1>Reset Your Password</h1>
    <p>Hey ${name}, we received a request to reset your password. Click the button below to choose a new password.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="cta-button" style="font-size: 16px; padding: 16px 40px; background: linear-gradient(135deg, #F05A9D, #A66CFF, #6366F1); color: #ffffff !important; text-decoration: none; border-radius: 14px; font-weight: 800; display: inline-block;">Reset Password Now →</a>
    </div>
    <p style="font-size: 13px; color: rgba(255,255,255,0.4);">Or copy and paste this direct URL into your browser:</p>
    <p style="font-size: 12px; word-break: break-all; color: #A66CFF; background: #141414; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">${resetUrl}</p>
    <p style="font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 20px;">Requested at ${timeStr}. This link expires in 1 hour. If you didn't request a password reset, ignore this email.</p>
  `, 'Reset Password — Uplan');

  return transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: `Reset Your Uplan Password [Ref: #${uniqueTag} - ${timeStr}] 🔑`,
    html,
  });
}

export async function sendOTPEmail(to: string, name: string, otp: string) {
  const html = getBaseTemplate(`
    <h1>Your Verification Code</h1>
    <p>Hey ${name}, use this one-time code to verify your identity:</p>
    <div class="code-box">
      <div class="code">${otp}</div>
    </div>
    <p>This code expires in <span class="highlight">10 minutes</span>. Do not share it with anyone.</p>
    <p style="font-size: 13px; color: rgba(255,255,255,0.4);">If you didn't request this code, someone may have entered your email by mistake. You can safely ignore this.</p>
  `, 'Verification Code — Uplan');

  return transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject: `${otp} — Your Uplan Verification Code`,
    html,
  });
}

// Utility: verify transporter connection
export async function verifyTransporter(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
}

export { transporter };
