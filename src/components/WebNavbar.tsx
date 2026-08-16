'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Home, 
  CheckSquare, 
  ShoppingCart, 
  BarChart2, 
  User, 
  LogOut 
} from 'lucide-react';

export default function WebNavbar() {
  const pathname = usePathname();
  const router = useRouter();

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
    <header className="border-b border-white/10 bg-[#141414] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center font-bold text-base shadow-md text-white">
            U
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">Uplan Web</span>
        </Link>

        {/* 5 Primary App Tabs matching Mobile App */}
        <div className="flex items-center gap-1.5 bg-[#1c1c1c] p-1 rounded-xl border border-white/10">
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
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Sign Out Action */}
        <button
          onClick={handleSignOut}
          className="px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </header>
  );
}
