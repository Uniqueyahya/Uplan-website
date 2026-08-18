import Link from 'next/link';
import { Calendar, CheckCircle2, ShoppingCart, ShieldCheck, Flame, Zap, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans">
      {/* Navigation Bar */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-black/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center font-bold text-base sm:text-lg shadow-lg shadow-purple-500/20">
              U
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Uplan
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link 
              href="/login" 
              className="px-3 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-xs text-gray-200 hover:text-white transition-all text-center"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-xs text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 text-center"
            >
              Get Started Free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center justify-center text-center relative">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/15 rounded-full blur-[100px] sm:blur-[140px]" />
          <div className="w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-pink-600/15 rounded-full blur-[90px] sm:blur-[120px]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10 text-purple-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-4 sm:mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Plan Your Day. Shop Smart. Track Goals.
        </div>

        <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] mb-4 sm:mb-5">
          Wake Up & Plan Your Day <br />
          <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
            No Timers Required.
          </span>
        </h1>

        <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mb-6 sm:mb-8 leading-relaxed">
          Uplan combines daily goal planning, digital Market Shopping Lists (Sugar, Soap, Groceries), and executive administrative management into one unified platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full justify-center">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-xs sm:text-sm text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition-all text-center"
          >
            Create Your Account
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-xs sm:text-sm text-gray-200 hover:text-white transition-all text-center"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 w-full mt-14 sm:mt-24 text-left">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 sm:mb-6">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Morning Day Planner</h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Decide what to do each morning. Create simple to-do goals without timers, or focus tasks when you need deep work.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-white/10 hover:border-pink-500/50 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4 sm:mb-6">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Market Shopping List 🛒</h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Stop using paper notes. Add sugar, soap, milk, and groceries directly to your app and check them off at the market.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#141414] border border-white/10 hover:border-indigo-500/50 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 sm:mb-6">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">4-Box Executive Admin</h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Super Admin dashboard for complete oversight: User Directory, Market Shopping analytics, Push Broadcasts, and Security Audit Logs.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-xs space-y-2">
        <div className="flex items-center justify-center gap-4 font-semibold">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>•</span>
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          <span>•</span>
          <Link href="/privacy-policy" className="text-gray-400 hover:text-purple-400 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="/delete-account" className="text-gray-400 hover:text-red-400 transition-colors">Delete Account</Link>
        </div>
        <p>© {new Date().getFullYear()} Uplan Web Portal. Syncing with mobile & database in real time.</p>
      </footer>
    </div>
  );
}
