import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Database, 
  Bell, 
  UserCheck, 
  Trash2, 
  Mail, 
  FileText, 
  Sparkles,
  Server,
  KeyRound
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Uplan',
  description: 'Learn how Uplan collects, uses, stores, and protects your information.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'August 17, 2026';
  const supportEmail = 'support@uplan.app';
  const smtpSupportEmail = 'adventureconnect7@gmail.com';

  const sections = [
    { id: 'sec-1', title: '1. Introduction' },
    { id: 'sec-2', title: '2. Information We Collect' },
    { id: 'sec-3', title: '3. Information You Provide' },
    { id: 'sec-4', title: '4. Account Information' },
    { id: 'sec-5', title: '5. Task and Productivity Data' },
    { id: 'sec-6', title: '6. Streak and Progress Data' },
    { id: 'sec-7', title: '7. Timer and Activity Data' },
    { id: 'sec-8', title: '8. Device and Notification Information' },
    { id: 'sec-9', title: '9. How We Use Information' },
    { id: 'sec-10', title: '10. How We Store Information' },
    { id: 'sec-11', title: '11. Supabase Infrastructure' },
    { id: 'sec-12', title: '12. Authentication & Credentials' },
    { id: 'sec-13', title: '13. Notifications & Reminders' },
    { id: 'sec-14', title: '14. Data Sharing & Non-Sale Commitment' },
    { id: 'sec-15', title: '15. Third-Party Service Providers' },
    { id: 'sec-16', title: '16. Data Retention' },
    { id: 'sec-17', title: '17. Account Deletion' },
    { id: 'sec-18', title: '18. Data Security & Technical Measures' },
    { id: 'sec-19', title: '19. Administrative Access & Controls' },
    { id: 'sec-20', title: '20. Children\'s Privacy' },
    { id: 'sec-21', title: '21. Your Data Rights & Choices' },
    { id: 'sec-22', title: '22. Changes to This Privacy Policy & Contact Us' },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Header Navigation */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Banner Section */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#141414] border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-4 h-4" /> Legal & Transparency
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
            Privacy Policy
          </h1>

          <p className="text-gray-400 text-base max-w-2xl leading-relaxed">
            At Uplan, we respect your privacy. This policy clearly explains how your information is collected, stored, and protected when you use the Uplan web portal and mobile application.
          </p>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
            <span>Last updated: <span className="text-gray-300 font-semibold">{lastUpdated}</span></span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              Active Production Policy
            </span>
          </div>
        </div>

        {/* Layout Grid: Table of Contents + Legal Document */}
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Table of Contents Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 sticky top-24 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" /> Table of Contents
              </h2>
              <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block text-xs text-gray-400 hover:text-purple-400 hover:translate-x-1 py-1.5 transition-all truncate"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Detailed Policy Text */}
          <div className="lg:col-span-8 space-y-10 text-gray-300 text-sm leading-relaxed font-normal">
            
            {/* Section 1 */}
            <section id="sec-1" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> 1. Introduction
              </h2>
              <p>
                Welcome to <strong>Uplan</strong> ("we", "our", or "us"). Uplan is a productivity and consistency platform available on web and mobile devices. Uplan helps users plan daily goals, manage task timers, maintain consecutive completion streaks, organize digital market shopping lists (such as groceries and household essentials), and analyze productivity metrics.
              </p>
              <p>
                This Privacy Policy describes our practices regarding the collection, use, disclosure, and protection of information when you access our services through our website (<strong>uplanapp.vercel.app</strong>) or our mobile application. By using Uplan, you consent to the data practices described in this policy.
              </p>
            </section>

            {/* Section 2 */}
            <section id="sec-2" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">2. Information We Collect</h2>
              <p>
                We adhere to a strict principle of minimal data collection. We only collect and process information that is essential for operating the application, authenticating your identity, preserving your productivity data across devices, and delivering requested notifications.
              </p>
              <p className="text-amber-400/90 text-xs font-semibold bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                Notice: We do NOT track your precise GPS location, access your contact lists, record audio/video, collect advertising identifiers, or sell your personal data.
              </p>
            </section>

            {/* Section 3 */}
            <section id="sec-3" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">3. Information You Provide</h2>
              <p>
                When you interact with Uplan, you directly provide us with information needed to personalize your account and store your productivity data. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li><strong className="text-white">Full Name:</strong> Used to personalize your account profile and dashboard interface.</li>
                <li><strong className="text-white">Email Address:</strong> Used as your primary account credential for sign-in, account recovery, and transactional emails.</li>
                <li><strong className="text-white">Phone Number:</strong> Optional or user-provided contact detail used for account identification and profile customization.</li>
                <li><strong className="text-white">Profile Avatar Image:</strong> Photos uploaded directly from your device file picker or photo library to display on your profile header.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="sec-4" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">4. Account Information</h2>
              <p>
                Your user account credentials and profile metadata are registered and stored securely in our database. When you create an account, a unique user identifier (UUID) is assigned to your profile. This identifier isolates your personal task records, market items, and statistics so they remain private to your account.
              </p>
            </section>

            {/* Section 5 */}
            <section id="sec-5" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">5. Task and Productivity Data</h2>
              <p>
                To provide goal-planning functionality, Uplan stores the task data you voluntarily input into the application:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-400">
                <li>Task names, descriptions, and category tags (e.g., Fitness, Work, Health, Personal).</li>
                <li>Target values and target units (e.g., 30 minutes, 10 pages, 5 repetitions).</li>
                <li>Task completion dates and daily status markers.</li>
                <li>Market Shopping List items (item name, quantity, purchase completion status).</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="sec-6" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">6. Streak and Progress Data</h2>
              <p>
                Uplan calculates your daily goal momentum by processing your completed tasks. We record your active consecutive streak count, best historical streak, last completed date, and streak freeze usage. This data is used solely to render your personal statistics and analytics charts on the Stats tab.
              </p>
            </section>

            {/* Section 7 */}
            <section id="sec-7" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">7. Timer and Activity Data</h2>
              <p>
                When you initiate a focus timer for timed tasks, the application records the timer session duration (in seconds), start timestamp, end timestamp, and completion status. This information allows us to calculate your total focus hours displayed in your analytics summary.
              </p>
            </section>

            {/* Section 8 */}
            <section id="sec-8" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">8. Device and Notification Information</h2>
              <p>
                If you grant permission on your mobile device, Uplan uses notification framework tokens (via Expo Notifications) to deliver local and push alerts for task countdown reminders, 5-minute timer remaining warnings, and task completion notices.
              </p>
              <p>
                Notification permissions are entirely controlled by your operating system settings. You can enable or disable notifications at any time in your device's System Settings.
              </p>
            </section>

            {/* Section 9 */}
            <section id="sec-9" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">9. How We Use Information</h2>
              <p>We use the collected information strictly for legitimate operational purposes:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-400">
                <li>To create, manage, and maintain your account.</li>
                <li>To synchronize your tasks, market items, and statistics between web and mobile devices.</li>
                <li>To calculate completion trends, percentage rates, and focus time statistics.</li>
                <li>To deliver password reset emails, verification codes, and essential transactional notices.</li>
                <li>To enforce security policies and protect the application against unauthorized access.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="sec-10" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" /> 10. How We Store Information
              </h2>
              <p>
                Application data and media assets are stored in enterprise-grade cloud databases and hosting infrastructure provided by Supabase and Vercel. Database tables are protected using Row Level Security (RLS) policies, ensuring that authenticated requests can only access data belonging to the authorized user account.
              </p>
            </section>

            {/* Section 11 */}
            <section id="sec-11" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" /> 11. Supabase Infrastructure
              </h2>
              <p>
                Uplan relies on Supabase as its core backend provider for PostgreSQL database storage and user authentication. Supabase processes user data on our behalf in compliance with modern data protection standards. No private database credentials or service role keys are exposed in client-side code or privacy documents.
              </p>
            </section>

            {/* Section 12 */}
            <section id="sec-12" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-pink-400" /> 12. Authentication & Credentials
              </h2>
              <p>
                Passwords submitted during account registration or password reset are encrypted using strong cryptographic hashing algorithms (such as bcrypt/argon2) managed natively by Supabase Auth. Your raw plaintext password is never stored in our database and is never visible to application administrators.
              </p>
            </section>

            {/* Section 13 */}
            <section id="sec-13" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" /> 13. Notifications & Reminders
              </h2>
              <p>
                Uplan sends transactional and operational emails (such as welcome messages, password reset verification links, and 6-digit verification codes) using secure Nodemailer SMTP infrastructure. We do not use your email address for unsolicited marketing or third-party spam.
              </p>
            </section>

            {/* Section 14 */}
            <section id="sec-14" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">14. Data Sharing & Non-Sale Commitment</h2>
              <p className="text-white font-bold">
                Uplan DOES NOT SELL, RENT, OR TRADE YOUR PERSONAL INFORMATION TO THIRD PARTIES OR ADVERTISERS.
              </p>
              <p>
                Information is disclosed only to essential cloud service providers necessary to operate the application (such as database hosting and email dispatch) or when required by law or legal process.
              </p>
            </section>

            {/* Section 15 */}
            <section id="sec-15" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">15. Third-Party Service Providers</h2>
              <p>The application integrates with the following technical service providers:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li><strong className="text-white">Supabase:</strong> Backend database, user authentication, and media storage.</li>
                <li><strong className="text-white">Vercel:</strong> Web hosting and serverless API execution.</li>
                <li><strong className="text-white">Nodemailer / SMTP:</strong> Transactional email dispatch for password recovery and account verification.</li>
                <li><strong className="text-white">Expo (Mobile):</strong> Push notification delivery and cross-platform mobile runtime.</li>
              </ul>
              <p className="text-xs text-gray-500">
                Note: Uplan does NOT integrate third-party advertising networks, third-party analytics trackers, or social media data broker SDKs.
              </p>
            </section>

            {/* Section 16 */}
            <section id="sec-16" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">16. Data Retention</h2>
              <p>
                We retain your account profile and productivity data for as long as your account remains active. If your account is suspended or deleted, your data is removed from active database tables in accordance with our deletion policies.
              </p>
            </section>

            {/* Section 17 */}
            <section id="sec-17" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" /> 17. Account Deletion & Right to Erase
              </h2>
              <p>
                You have the absolute right to request the permanent deletion of your Uplan account and all associated personal data at any time.
              </p>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 space-y-2">
                <p className="font-bold text-xs uppercase tracking-wider">How to request account deletion:</p>
                <p className="text-xs">
                  Send an email request from your registered email address to <a href={`mailto:${supportEmail}`} className="underline font-bold text-white">{supportEmail}</a> or <a href={`mailto:${smtpSupportEmail}`} className="underline font-bold text-white">{smtpSupportEmail}</a> with the subject line <strong>"Account Deletion Request"</strong>.
                </p>
                <p className="text-xs text-gray-400">
                  Alternatively, authorized administrators can execute permanent account deletion upon request through the Super Admin Portal. Once processed, all tasks, completions, focus timers, market items, and profile records are permanently removed.
                </p>
              </div>
            </section>

            {/* Section 18 */}
            <section id="sec-18" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" /> 18. Data Security & Technical Measures
              </h2>
              <p>
                We implement reasonable technical and organizational measures to safeguard your information against unauthorized access, loss, or alteration. These measures include encrypted SSL/TLS connections in transit, Row Level Security in our database, and restricted administrative privileges.
              </p>
              <p className="text-xs text-gray-400 italic">
                Disclaimer: While we take reasonable and standard precautions to secure your data, no method of electronic transmission or cloud storage is guaranteed to be 100% immune from security vulnerabilities.
              </p>
            </section>

            {/* Section 19 */}
            <section id="sec-19" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" /> 19. Administrative Access & System Oversight
              </h2>
              <p>
                Uplan includes a Super Admin Portal used by authorized system administrators to oversee system health, review user directory metrics, monitor market list activity, and manage account statuses (such as account suspension or account deletion).
              </p>
              <p className="text-xs text-purple-300 bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                Important: Administrators do NOT have access to view or decrypt user passwords. Passwords are securely hashed by Supabase Auth and remain completely inaccessible to application administrators.
              </p>
            </section>

            {/* Section 20 */}
            <section id="sec-20" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">20. Children's Privacy</h2>
              <p>
                Uplan is a general audience productivity tool intended for individuals who can legally enter into online services. We do not knowingly solicit or collect personal information from children under the age of 13. If we discover that a child under 13 has registered an account without parental consent, we will promptly take steps to delete the account and associated records.
              </p>
            </section>

            {/* Section 21 */}
            <section id="sec-21" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h2 className="text-xl font-extrabold text-white">21. Your Data Rights & Choices</h2>
              <p>Depending on your jurisdiction, you possess the following rights regarding your data:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-400">
                <li><strong className="text-white">Access & Rectification:</strong> You can review and edit your account profile name and avatar image directly on the Profile page.</li>
                <li><strong className="text-white">Data Erasure:</strong> You may request complete account and data deletion at any time.</li>
                <li><strong className="text-white">Notification Preferences:</strong> You may toggle task reminders and system push notifications on or off within your device settings.</li>
              </ul>
            </section>

            {/* Section 22 */}
            <section id="sec-22" className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-pink-400" /> 22. Changes to Policy & Contact Us
              </h2>
              <p>
                We may update this Privacy Policy periodically to reflect changes in application functionality or legal requirements. Any modifications will be posted directly on this page with an updated "Last Updated" revision date.
              </p>

              <div className="p-6 rounded-2xl bg-[#1c1c1c] border border-white/10 space-y-3">
                <h3 className="font-bold text-base text-white">Contact Information</h3>
                <p className="text-xs text-gray-400">
                  For privacy-related questions, data access requests, or account deletion assistance, please contact the Uplan support team:
                </p>
                <div className="space-y-1 text-xs">
                  <p><strong className="text-purple-400">Primary Support Email:</strong> <a href={`mailto:${supportEmail}`} className="text-white hover:underline font-semibold">{supportEmail}</a></p>
                  <p><strong className="text-purple-400">Operations Email:</strong> <a href={`mailto:${smtpSupportEmail}`} className="text-white hover:underline font-semibold">{smtpSupportEmail}</a></p>
                  <p><strong className="text-purple-400">Official Portal:</strong> <a href="https://uplanapp.vercel.app" className="text-white hover:underline font-semibold">https://uplanapp.vercel.app</a></p>
                </div>
              </div>
            </section>

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
          <Link href="/privacy-policy" className="text-purple-400 hover:underline">Privacy Policy</Link>
        </div>
        <p>© {new Date().getFullYear()} Uplan Productivity Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
