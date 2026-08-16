'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import WebNavbar from '@/components/WebNavbar';
import { 
  CheckSquare, 
  ShoppingCart, 
  BarChart2, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Plus
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
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
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center font-sans">
        <div className="text-gray-400 font-semibold animate-pulse">Loading Home Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans flex flex-col">
      <WebNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-indigo-500/15 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-extrabold uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Welcome Back, {user?.user_metadata?.full_name || 'Planner'}!
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Main Home Overview
            </h1>
            <p className="text-gray-400 text-sm max-w-xl">
              Track your daily progress, start focus timers, manage market shopping lists, and view weekly goals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/tasks"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-sm text-white shadow-lg hover:opacity-95 transition-all flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" /> Open Tasks & Planner
            </Link>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-2">
            <div className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">Completion Rate</div>
            <div className="text-3xl font-extrabold text-purple-400">{progressPercentage}%</div>
            <div className="text-xs text-gray-500">Today's Goal Rate</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-2">
            <div className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">Completed Tasks</div>
            <div className="text-3xl font-extrabold text-emerald-400">{totalCompleted}</div>
            <div className="text-xs text-gray-500">Lifetime Accomplished</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-2">
            <div className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">Focus Time</div>
            <div className="text-3xl font-extrabold text-pink-400">{focusHoursText}</div>
            <div className="text-xs text-gray-500">Logged Sessions</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-2">
            <div className="text-gray-400 text-xs font-extrabold uppercase tracking-wider">Active Goals</div>
            <div className="text-3xl font-extrabold text-indigo-400">{totalCount}</div>
            <div className="text-xs text-gray-500">Planned Today</div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Today's Tasks Shortcut */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4 hover:border-purple-500/50 transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <CheckSquare className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg mb-1">Tasks & Planner</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Manage untimed to-do goals, timed focus tasks, and full weekly targets.
              </p>
            </div>
            <Link
              href="/dashboard/tasks"
              className="block w-full py-2.5 text-center rounded-xl bg-purple-600/20 text-purple-300 font-bold border border-purple-500/30 text-xs hover:bg-purple-600/30 transition-all"
            >
              Go to Tasks →
            </Link>
          </div>

          {/* Card 2: Market List Shortcut */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4 hover:border-pink-500/50 transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg mb-1">Market Shopping List 🛒</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Add sugar, soap, groceries, and check them off at the market.
              </p>
            </div>
            <Link
              href="/dashboard/market"
              className="block w-full py-2.5 text-center rounded-xl bg-pink-600/20 text-pink-300 font-bold border border-pink-500/30 text-xs hover:bg-pink-600/30 transition-all"
            >
              Go to Market List →
            </Link>
          </div>

          {/* Card 3: Stats Analytics Shortcut */}
          <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4 hover:border-indigo-500/50 transition-all group">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <BarChart2 className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg mb-1">Analytics & Insights 📊</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Review this week, this month, and all-time completion trends.
              </p>
            </div>
            <Link
              href="/dashboard/stats"
              className="block w-full py-2.5 text-center rounded-xl bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30 text-xs hover:bg-indigo-600/30 transition-all"
            >
              View Stats Insights →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
