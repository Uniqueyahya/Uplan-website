'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();

    try {
      // Hardcoded production Vercel URL as requested
      const resetUrl = 'https://uplanapp.vercel.app/reset-password';

      // 1. Call Supabase Auth reset with explicit Vercel redirectTo URL
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: resetUrl,
      });

      if (error) {
        throw new Error(error.message);
      }

      // 2. Also attempt custom Nodemailer send if API environment variables are present
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'password-reset',
            to: cleanEmail,
            name: cleanEmail.split('@')[0],
            url: resetUrl,
          }),
        });
      } catch (e) {
        // Fallback silently if Vercel env vars are not set — Supabase custom SMTP handled it!
      }

      setSuccessMsg(`A password reset link has been sent to ${cleanEmail}. Please check your inbox or spam folder.`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset link. Please try again.';
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-center items-center px-6 py-12 relative font-sans">
      <div className="w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Forgot Password?</h1>
          <p className="text-gray-400 text-sm">Enter your registered email address and we'll send you instructions to reset your password.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {!successMsg ? (
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter your email address"
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-white shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending Instructions...' : 'Send Password Reset Email'}
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="w-full block text-center py-3.5 rounded-xl bg-white/10 hover:bg-white/15 font-bold text-white transition-all text-sm"
          >
            Return to Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
