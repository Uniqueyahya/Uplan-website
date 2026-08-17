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
    { label: 'Market List 🛒', href: '/dashboard/market', icon: ShoppingCart },
    { label: 'Stats 📊', href: '/dashboard/stats', icon: BarChart2 },
    { label: 'Profile 👤', href: '/dashboard/profile', icon: User },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <header className={`border-b sticky top-0 z-50 transition-colors duration-200 ${
      isLight ? 'bg-white border-slate-200 text-slate-900 shadow-sm' : 'bg-[#141414] border-white/10 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center font-bold text-base shadow-md text-white">
            U
          </div>
          <span className={`font-extrabold text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Uplan Web
          </span>
        </Link>

        {/* 5 Primary App Tabs matching Mobile App */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${
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

        {/* Actions: Theme Toggle & Sign Out */}
        <div className="flex items-center gap-3">
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
            className="px-3.5 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
