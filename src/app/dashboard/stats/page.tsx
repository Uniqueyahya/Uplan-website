'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import WebNavbar from '@/components/WebNavbar';
import { BarChart2, TrendingUp, Clock, CheckCircle2, Award, Sparkles } from 'lucide-react';

export default function StatsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'week' | 'month' | 'all'>('week');
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [weeklyBarData, setWeeklyBarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        router.replace('/login');
        return;
      }
      const userId = sessionData.session.user.id;

      try {
        // Fetch Total Tasks
        const { count: totalC } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        // Fetch Completed Tasks
        const { count: completedC } = await supabase
          .from('task_completions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_completed', true);

        const totalNum = totalC || 0;
        const compNum = completedC || 0;

        setTotalTasks(totalNum);
        setTotalCompleted(compNum);
        setCompletionRate(totalNum > 0 ? Math.round((compNum / totalNum) * 100) : 0);

        // Fetch Timer Focus Sessions
        const { data: timerData } = await supabase
          .from('timer_sessions')
          .select('duration_seconds')
          .eq('user_id', userId)
          .eq('status', 'completed');

        if (timerData) {
          const totalSec = timerData.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
          setFocusSeconds(totalSec);
        }

        // Mock 7-day completion trend data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        setWeeklyBarData(days.map((day, idx) => ({
          day,
          count: compNum > 0 ? Math.min(10, (idx + 1) * 2) : 0,
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [filter, router]);

  const focusHoursText = focusSeconds > 0 
    ? `${Math.floor(focusSeconds / 3600)}h ${Math.floor((focusSeconds % 3600) / 60)}m` 
    : '0h 0m';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center font-sans">
        <div className="text-gray-400 font-semibold animate-pulse">Loading Analytics & Insights...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans flex flex-col">
      <WebNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Header & Filter Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <BarChart2 className="w-8 h-8 text-purple-400" /> Analytics & Insights 📊
            </h1>
            <p className="text-gray-400 text-sm">Review completion trends, focus time, and productivity metrics</p>
          </div>

          <div className="flex items-center bg-[#1c1c1c] p-1.5 rounded-2xl border border-white/10">
            {(['week', 'month', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase">Completion Rate</span>
            <div className="text-3xl font-extrabold text-purple-400">{completionRate}%</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase">Completed Tasks</span>
            <div className="text-3xl font-extrabold text-emerald-400">{totalCompleted}</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase">Focus Time</span>
            <div className="text-3xl font-extrabold text-pink-400">{focusHoursText}</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase">Total Tasks</span>
            <div className="text-3xl font-extrabold text-indigo-400">{totalTasks}</div>
          </div>
        </div>

        {/* Performance Overview Banner */}
        <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Performance Overview
            </h2>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              {completionRate}% Success Rate
            </span>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed">
            You have accomplished <span className="text-white font-bold">{totalCompleted} tasks</span> so far. Keep up the great consistency and goal momentum!
          </p>
        </div>

        {/* Weekly Completion Trends Bar Chart */}
        <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-6">
          <h2 className="text-xl font-bold">Completion Trends</h2>

          <div className="h-48 flex items-end justify-between gap-4 pt-8 px-4 border-b border-white/10">
            {weeklyBarData.map((b) => (
              <div key={b.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div 
                  className="w-full max-w-[36px] bg-gradient-to-t from-pink-500 to-purple-500 rounded-t-xl transition-all duration-500 group-hover:brightness-125"
                  style={{ height: `${Math.max(15, b.count * 10)}%` }}
                />
                <span className="text-xs text-gray-400 font-bold">{b.day}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
