'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import WebNavbar from '@/components/WebNavbar';
import { useThemeContext } from '@/context/ThemeContext';
import { 
  CheckSquare, 
  ShoppingCart, 
  BarChart2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const isLight = theme === 'light';

  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [focusHoursText, setFocusHoursText] = useState('0h 0m');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        router.replace('/login');
        return;
      }
      const u = sessionData.session.user;
      setUser(u);
      
      if (u.email === 'adminuplan@gmail.com') {
        router.replace('/admin');
        return;
      }

      // Check if user is suspended
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', u.id)
        .single();

      if (profile && profile.status === 'suspended') {
        await supabase.auth.signOut();
        router.replace('/login');
        return;
      }

      // Fetch Today's Tasks
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: rawTasks } = await supabase
        .from('tasks')
        .select('*, task_completions(*)')
        .eq('user_id', u.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (rawTasks) {
        const formatted = rawTasks.map((t: any) => {
          const comp = t.task_completions?.find((c: any) => c.completion_date === todayStr);
          return {
            id: t.id,
            name: t.name,
            isCompleted: comp ? Boolean(comp.is_completed) : false,
            timerEnabled: Boolean(t.timer_enabled),
          };
        });
        setTasks(formatted);
      }

      // Fetch Total Completed
      const { count: compCount } = await supabase
        .from('task_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', u.id)
        .eq('is_completed', true);

      setTotalCompleted(compCount || 0);

      // Fetch Focus Time
      const { data: timerData } = await supabase
        .from('timer_sessions')
        .select('duration_seconds')
        .eq('user_id', u.id)
        .eq('status', 'completed');

      if (timerData) {
        const totalSec = timerData.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        setFocusHoursText(`${h}h ${m}m`);
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080808] text-white'}`}>
        <div className="font-semibold animate-pulse opacity-70">Loading Home Dashboard...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080808] text-white'
    }`}>
      <WebNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-12 space-y-6 sm:space-y-8">
        {/* Welcome Banner */}
        <div className={`p-5 sm:p-8 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 transition-all ${
          isLight 
            ? 'bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-slate-200 shadow-sm' 
            : 'bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-indigo-500/15 border-white/10'
        }`}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-extrabold uppercase mb-2 sm:mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Welcome Back, {user?.user_metadata?.full_name || 'Planner'}!
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Main Home Overview
            </h1>
            <p className={`text-xs sm:text-sm max-w-xl ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Track your daily progress, start focus timers, manage market shopping lists, and view weekly goals.
            </p>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <Link
              href="/dashboard/tasks"
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-xs sm:text-sm text-white shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 text-center"
            >
              <CheckSquare className="w-4 h-4" /> Open Tasks & Planner
            </Link>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-1.5 sm:space-y-2 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'
          }`}>
            <div className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Completion Rate</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">{progressPercentage}%</div>
            <div className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Today's Goal Rate</div>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border space-y-1.5 sm:space-y-2 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'
          }`}>
            <div className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Completed Tasks</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalCompleted}</div>
            <div className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Lifetime Accomplished</div>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border space-y-1.5 sm:space-y-2 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'
          }`}>
            <div className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Focus Time</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-pink-600 dark:text-pink-400">{focusHoursText}</div>
            <div className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Logged Sessions</div>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border space-y-1.5 sm:space-y-2 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'
          }`}>
            <div className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Active Goals</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{totalCount}</div>
            <div className={`text-[10px] sm:text-xs ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Planned Today</div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Today's Tasks Shortcut */}
          <div className={`p-6 rounded-2xl border space-y-4 transition-all group ${
            isLight ? 'bg-white border-slate-200 hover:border-purple-400 shadow-sm' : 'bg-[#141414] border-white/10 hover:border-purple-500/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <CheckSquare className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg mb-1">Tasks & Planner</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Manage untimed to-do goals, timed focus tasks, and full weekly targets.
              </p>
            </div>
            <Link
              href="/dashboard/tasks"
              className="block w-full py-2 text-center rounded-xl bg-purple-600/20 text-purple-600 dark:text-purple-300 font-bold border border-purple-500/30 text-xs hover:bg-purple-600/30 transition-all"
            >
              Go to Tasks →
            </Link>
          </div>

          {/* Card 2: Market List Shortcut */}
          <div className={`p-6 rounded-2xl border space-y-4 transition-all group ${
            isLight ? 'bg-white border-slate-200 hover:border-pink-400 shadow-sm' : 'bg-[#141414] border-white/10 hover:border-pink-500/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg mb-1">Market Shopping List 🛒</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Add sugar, soap, groceries, and check them off at the market.
              </p>
            </div>
            <Link
              href="/dashboard/market"
              className="block w-full py-2 text-center rounded-xl bg-pink-600/20 text-pink-600 dark:text-pink-300 font-bold border border-pink-500/30 text-xs hover:bg-pink-600/30 transition-all"
            >
              Go to Market List →
            </Link>
          </div>

          {/* Card 3: Stats Analytics Shortcut */}
          <div className={`p-6 rounded-2xl border space-y-4 transition-all group ${
            isLight ? 'bg-white border-slate-200 hover:border-indigo-400 shadow-sm' : 'bg-[#141414] border-white/10 hover:border-indigo-500/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BarChart2 className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg mb-1">Analytics & Insights 📊</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Review this week, this month, and all-time completion trends.
              </p>
            </div>
            <Link
              href="/dashboard/stats"
              className="block w-full py-2 text-center rounded-xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/30 text-xs hover:bg-indigo-600/30 transition-all"
            >
              View Stats Insights →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
