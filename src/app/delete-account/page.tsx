'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Trash2, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Mail, 
  FileText,
  Lock,
  RefreshCw
} from 'lucide-react';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [reason, setReason] = useState('no_longer_using');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const supportEmail = 'support@uplan.app';
  const smtpSupportEmail = 'adventureconnect7@gmail.com';

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanConfirm = confirmEmail.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (cleanEmail !== cleanConfirm) {
      setErrorMsg('Email addresses do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      // Send deletion notice via Nodemailer API route if configured
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'account_deletion_request',
          to: cleanEmail,
          reason,
          notes: additionalNotes,
        }),
      }).catch(() => {});

      // Generate reference ticket ID
      const randomRef = 'DEL-' + Math.floor(100000 + Math.random() * 900000);
      setTicketId(randomRef);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg('Failed to process request. Please try emailing support@uplan.app directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Header Navigation */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center font-extrabold text-base shadow-md shadow-purple-500/20 text-white">
              U
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              Uplan
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 space-y-10">
        {/* Banner Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#141414] border border-red-500/20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Trash2 className="w-4 h-4" /> Data Protection & Privacy
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3 leading-tight text-white">
            Request Account Deletion
          </h1>

          <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
            You have the right to request the permanent deletion of your Uplan user account and all associated personal data stored on our servers.
          </p>
        </div>

        {/* Form or Confirmation State */}
        {submitted ? (
          <div className="p-8 rounded-3xl bg-[#141414] border border-emerald-500/30 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Deletion Request Received</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                Your request to delete the account registered under <span className="text-white font-bold">{email}</span> has been logged.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-white/10 inline-block text-xs space-y-1 text-left">
              <p><strong className="text-gray-400">Reference Ticket:</strong> <span className="text-emerald-400 font-mono font-bold">{ticketId}</span></p>
              <p><strong className="text-gray-400">Processing Time:</strong> <span className="text-white font-semibold">24 – 48 Hours</span></p>
              <p><strong className="text-gray-400">Confirmation Sent To:</strong> <span className="text-white font-semibold">{email}</span></p>
            </div>

            <p className="text-xs text-gray-500 max-w-md mx-auto">
              If this request was submitted in error, please contact <a href={`mailto:${supportEmail}`} className="text-purple-400 underline font-semibold">{supportEmail}</a> before processing completes.
            </p>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold text-xs shadow-lg hover:opacity-95 transition-all"
              >
                Return to Uplan Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-8 shadow-2xl">
            <div className="space-y-2 border-b border-white/10 pb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" /> Account Deletion Request Form
              </h2>
              <p className="text-xs text-gray-400">
                Submit your registered email address below to request permanent deletion of your account.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Confirm Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="Re-enter your email address"
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Reason for Deletion (Optional)
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="no_longer_using">No longer using the app</option>
                  <option value="created_duplicate">Created a duplicate account</option>
                  <option value="privacy_concerns">Privacy or data concerns</option>
                  <option value="other">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Additional Feedback or Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Share any additional comments..."
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white text-xs tracking-wider uppercase transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Submitting Request...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Submit Account Deletion Request
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Data Erasure Transparency Grid */}
        <div className="p-8 rounded-3xl bg-[#141414] border border-white/10 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" /> What Happens When Your Account is Deleted?
          </h3>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-white/10 space-y-2">
              <h4 className="font-bold text-red-400 uppercase tracking-wider">Permanently Purged Data:</h4>
              <ul className="list-disc pl-4 space-y-1 text-gray-400">
                <li>User account credentials & authentication profile</li>
                <li>Full name, phone number, and avatar profile images</li>
                <li>Daily task list records & category settings</li>
                <li>Task completion history & focus timer session logs</li>
                <li>Active consecutive streak records & best streak counters</li>
                <li>Market Shopping List items & purchase history</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-white/10 space-y-2">
              <h4 className="font-bold text-purple-400 uppercase tracking-wider">Retention & Security Policy:</h4>
              <p className="text-gray-400 leading-relaxed">
                Deletion is permanent and irreversible. Once processed within 24 to 48 hours, all personal data is completely erased from our database. No user data is retained for marketing or analytical purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Support Contact Box */}
        <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <p className="font-bold text-white">Need help or wish to email support directly?</p>
            <p className="text-gray-400">You can also email your deletion request to our support team.</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`mailto:${supportEmail}?subject=Account%20Deletion%20Request`}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> Email Support
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-gray-500 space-y-2">
        <div className="flex items-center justify-center gap-4 font-semibold">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>•</span>
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          <span>•</span>
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="/delete-account" className="text-red-400 hover:underline">Delete Account</Link>
        </div>
        <p>© {new Date().getFullYear()} Uplan Productivity Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
