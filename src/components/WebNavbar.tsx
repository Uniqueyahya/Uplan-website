'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useThemeContext } from '@/context/ThemeContext';
import { 
  Home, 
  CheckSquare, 
  ShoppingCart, 
  BarChart2, 
  User, 
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

export default function WebNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useThemeContext();
  const isLight = theme === 'light';

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { label: 'Market', href: '/dashboard/market', icon: ShoppingCart },
    { label: 'Stats', href: '/dashboard/stats', icon: BarChart2 },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <>
      {/* Top Header Navigation */}
      <header className={`border-b sticky top-0 z-40 transition-colors duration-200 ${
        isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm backdrop-blur-md' : 'bg-[#141414]/95 border-white/10 text-white backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center font-extrabold text-sm sm:text-base shadow-md text-white">
              U
            </div>
            <span className={`font-extrabold text-base sm:text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Uplan
            </span>
          </Link>

          {/* Desktop Navigation Tabs (Hidden on mobile <768px) */}
          <div className={`hidden md:flex items-center gap-1.5 p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#1c1c1c] border-white/10'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons: Theme Toggle & Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all ${
                isLight 
                  ? 'bg-slate-100 border-slate-300 text-amber-600 hover:bg-slate-200' 
                  : 'bg-white/5 border-white/10 text-purple-300 hover:bg-white/10'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to White Mode'}
            >
              {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleSignOut}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Visible only on mobile <768px) */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-lg px-2 py-2 transition-colors duration-200 ${
        isLight ? 'bg-white/95 border-slate-200 text-slate-900 shadow-lg' : 'bg-[#141414]/95 border-white/10 text-white'
      }`}>
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-purple-400 font-extrabold scale-105'
                    : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-purple-500/20 text-purple-400' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
