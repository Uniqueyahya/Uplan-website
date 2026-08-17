'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import WebNavbar from '@/components/WebNavbar';
import { useThemeContext } from '@/context/ThemeContext';
import { BarChart2, TrendingUp } from 'lucide-react';

export default function StatsPage() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const isLight = theme === 'light';

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
        // Determine date range based on filter
        const now = new Date();
        let startDate: string;
        if (filter === 'week') {
          const d = new Date(now);
          d.setDate(d.getDate() - 6);
          startDate = d.toISOString().split('T')[0];
        } else if (filter === 'month') {
          const d = new Date(now);
          d.setDate(d.getDate() - 29);
          startDate = d.toISOString().split('T')[0];
        } else {
          startDate = '2020-01-01';
        }
        const endDate = now.toISOString().split('T')[0];

        const { count: totalC } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        // Fetch completions in the date range
        const { data: completionsInRange } = await supabase
          .from('task_completions')
          .select('completion_date, is_completed')
          .eq('user_id', userId)
          .eq('is_completed', true)
          .gte('completion_date', startDate)
          .lte('completion_date', endDate);

        const compNum = completionsInRange?.length || 0;
        const totalNum = totalC || 0;

        setTotalTasks(totalNum);
        setTotalCompleted(compNum);
        setCompletionRate(totalNum > 0 ? Math.round((compNum / totalNum) * 100) : 0);

        const { data: timerData } = await supabase
          .from('timer_sessions')
          .select('duration_seconds')
          .eq('user_id', userId)
          .eq('status', 'completed');

        if (timerData) {
          const totalSec = timerData.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
          setFocusSeconds(totalSec);
        }

        // Build real completion trends — group completions by date
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const countByDate: Record<string, number> = {};
        if (completionsInRange) {
          for (const c of completionsInRange) {
            const d = c.completion_date;
            countByDate[d] = (countByDate[d] || 0) + 1;
          }
        }

        // For "week" filter show 7 days, "month" show last 7 days summary, "all" show last 7 days
        const barDays: { day: string; count: number; isToday: boolean }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const dayLabel = dayNames[d.getDay()];
          barDays.push({
            day: dayLabel,
            count: countByDate[dateStr] || 0,
            isToday: i === 0,
          });
        }
        setWeeklyBarData(barDays);
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
      <div className={`min-h-screen flex items-center justify-center font-sans ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080808] text-white'}`}>
        <div className="font-semibold animate-pulse opacity-70">Loading Analytics & Insights...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080808] text-white'
    }`}>
      <WebNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <BarChart2 className="w-8 h-8 text-purple-500" /> Analytics & Insights 📊
            </h1>
            <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Review completion trends, focus time, and productivity metrics</p>
          </div>

          <div className={`flex items-center p-1.5 rounded-2xl border ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#1c1c1c] border-white/10'
          }`}>
            {(['week', 'month', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-purple-600 text-white shadow-md'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white'
                }`}
              >
                {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-6 rounded-2xl border space-y-1 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'}`}>
            <span className="text-xs text-gray-500 font-bold uppercase">Completion Rate</span>
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{completionRate}%</div>
          </div>

          <div className={`p-6 rounded-2xl border space-y-1 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'}`}>
            <span className="text-xs text-gray-500 font-bold uppercase">Completed Tasks</span>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalCompleted}</div>
          </div>

          <div className={`p-6 rounded-2xl border space-y-1 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'}`}>
            <span className="text-xs text-gray-500 font-bold uppercase">Focus Time</span>
            <div className="text-3xl font-extrabold text-pink-600 dark:text-pink-400">{focusHoursText}</div>
          </div>

          <div className={`p-6 rounded-2xl border space-y-1 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'}`}>
            <span className="text-xs text-gray-500 font-bold uppercase">Total Tasks</span>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{totalTasks}</div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border space-y-3 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Performance Overview
            </h2>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              {completionRate}% Success Rate
            </span>
          </div>

          <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            You have accomplished <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{totalCompleted} tasks</span> so far. Keep up the great consistency and goal momentum!
          </p>
        </div>

        <div className={`p-6 rounded-2xl border space-y-6 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'}`}>
          <h2 className="text-xl font-bold">Completion Trends (Last 7 Days)</h2>

          <div className={`h-48 flex items-end justify-between gap-4 pt-8 px-4 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
            {(() => {
              const maxCount = Math.max(...weeklyBarData.map(b => b.count), 1);
              return weeklyBarData.map((b) => (
                <div key={b.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className={`text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                    {b.count}
                  </span>
                  <div 
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-500 group-hover:brightness-125 ${
                      (b as { isToday?: boolean }).isToday
                        ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-t from-pink-500 to-purple-500'
                    }`}
                    style={{ height: b.count > 0 ? `${Math.max(12, (b.count / maxCount) * 100)}%` : '4%' }}
                  />
                  <span className={`text-xs font-bold ${(b as { isToday?: boolean }).isToday ? 'text-emerald-500' : 'text-gray-500'}`}>
                    {b.day}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>
      </main>
    </div>
  );
}
