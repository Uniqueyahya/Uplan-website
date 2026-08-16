'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import WebNavbar from '@/components/WebNavbar';
import { scheduleWebTimerNotifications, cancelWebTimerNotifications } from '@/lib/notifications';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  LogOut, 
  CheckSquare, 
  Play, 
  Pause, 
  RotateCcw,
  Clock,
  Sparkles,
  Flame,
  Check,
  History,
  Calendar as CalendarIcon,
  X,
  Eye,
  Target
} from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'weekly' | 'history'>('today');
  const [loading, setLoading] = useState(true);

  // New Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskMode, setTaskMode] = useState<'todo' | 'timer'>('todo');
  const [targetDuration, setTargetDuration] = useState<number>(30);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Task Detail & Dedicated Timer Modal State
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Live Bleeding Timer State
  const [activeTimerTask, setActiveTimerTask] = useState<any>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [scheduledWebTimers, setScheduledWebTimers] = useState<any>(null);

  // Weekly Target Planner State
  const [weeklyTargets, setWeeklyTargets] = useState<any[]>([]);
  const [newWeeklyTitle, setNewWeeklyTitle] = useState('');
  const [newWeeklyAmount, setNewWeeklyAmount] = useState('5');
  const [newWeeklyUnit, setNewWeeklyUnit] = useState('times');
  const [showNewWeeklyModal, setShowNewWeeklyModal] = useState(false);

  // History Tab State
  const [historyDate, setHistoryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [historyTasks, setHistoryTasks] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchTasks = async (userId: string, dateStr: string) => {
    try {
      const { data: rawTasks } = await supabase
        .from('tasks')
        .select('*, task_completions(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (rawTasks) {
        const formatted = rawTasks.map((t: any) => {
          const comp = t.task_completions?.find((c: any) => c.completion_date === dateStr);
          return {
            id: t.id,
            name: t.name,
            targetValue: t.target_value || 30,
            isCompleted: comp ? Boolean(comp.is_completed) : false,
            completedAt: comp?.completed_at ? new Date(comp.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
            timerEnabled: Boolean(t.timer_enabled),
          };
        });
        setTasks(formatted);
      }
    } catch (e) {
      setTasks([]);
    }
  };

  const fetchWeeklyTargets = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('weekly_targets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        setWeeklyTargets(data);
      }
    } catch (e) {
      setWeeklyTargets([]);
    }
  };

  const fetchHistoryForDate = async (userId: string, dateStr: string) => {
    setHistoryLoading(true);
    try {
      const { data: completions } = await supabase
        .from('task_completions')
        .select('*, tasks(*)')
        .eq('user_id', userId)
        .eq('completion_date', dateStr);

      if (completions) {
        const formatted = completions.map((c: any) => ({
          id: c.id,
          taskName: c.tasks?.name || 'Completed Goal',
          targetValue: c.target_value || 1,
          isCompleted: Boolean(c.is_completed),
          completedAt: c.completed_at ? new Date(c.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier Today',
          timerEnabled: Boolean(c.tasks?.timer_enabled),
        }));
        setHistoryTasks(formatted);
      } else {
        setHistoryTasks([]);
      }
    } catch (e) {
      setHistoryTasks([]);
    } finally {
      setHistoryLoading(false);
    }
  };

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

      await fetchTasks(u.id, selectedDate);
      await fetchWeeklyTargets(u.id);
      await fetchHistoryForDate(u.id, historyDate);
      setLoading(false);
    };

    checkUser();
  }, [selectedDate, router]);

  useEffect(() => {
    if (user?.id && activeSubTab === 'history') {
      fetchHistoryForDate(user.id, historyDate);
    }
  }, [historyDate, activeSubTab, user]);

  // Live Bleeding Countdown Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning && activeTimerTask) {
      setIsTimerRunning(false);
      handleToggleTask({ ...activeTimerTask, isCompleted: false });
      alert(`⏱️ Task Alarm! Bleeding Timer Finished for "${activeTimerTask.name}"! Goal Completed! 🎉`);
      setActiveTimerTask(null);
      if (selectedTask?.id === activeTimerTask.id) {
        setSelectedTask((prev: any) => prev ? { ...prev, isCompleted: true } : null);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft, activeTimerTask]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      const activeUser = userData?.user || user;
      if (!activeUser?.id) {
        alert('Session expired. Please sign in again.');
        router.replace('/login');
        return;
      }

      const isTimer = taskMode === 'timer';

      const { error } = await supabase.from('tasks').insert([{
        user_id: activeUser.id,
        name: taskTitle.trim(),
        target_value: isTimer ? targetDuration : 1,
        target_unit: isTimer ? 'minutes' : 'times',
        frequency: 'daily',
        timer_enabled: isTimer,
        status: 'active',
      }]);

      if (error) {
        alert('Failed to save task: ' + error.message);
      } else {
        setTaskTitle('');
        setTaskMode('todo');
        setShowNewTaskModal(false);
        await fetchTasks(activeUser.id, selectedDate);
      }
    } catch (e: any) {
      alert('Error creating task: ' + (e.message || 'Unknown error'));
    }
  };

  const handleCreateWeeklyTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeeklyTitle.trim() || !user?.id) return;

    try {
      const targetVal = parseInt(newWeeklyAmount) || 5;
      const weekStart = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('weekly_targets').insert([{
        user_id: user.id,
        title: newWeeklyTitle.trim(),
        target_amount: targetVal,
        current_amount: 0,
        unit: newWeeklyUnit,
        week_start_date: weekStart,
        is_achieved: false,
      }]);

      if (!error) {
        setNewWeeklyTitle('');
        setShowNewWeeklyModal(false);
        await fetchWeeklyTargets(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleIncrementWeeklyTarget = async (target: any) => {
    const nextAmount = target.current_amount + 1;
    const isAchieved = nextAmount >= target.target_amount;

    setWeeklyTargets(prev => prev.map(t => t.id === target.id ? { ...t, current_amount: nextAmount, is_achieved: isAchieved } : t));

    try {
      await supabase.from('weekly_targets').update({
        current_amount: nextAmount,
        is_achieved: isAchieved
      }).eq('id', target.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteWeeklyTarget = async (id: string) => {
    setWeeklyTargets(prev => prev.filter(t => t.id !== id));
    try {
      await supabase.from('weekly_targets').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTask = async (task: any) => {
    if (!user?.id) return;

    const nextState = !task.isCompleted;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: nextState } : t));
    if (selectedTask?.id === task.id) {
      setSelectedTask((prev: any) => prev ? { ...prev, isCompleted: nextState } : null);
    }

    if (activeTimerTask?.id === task.id && nextState) {
      setIsTimerRunning(false);
      setActiveTimerTask(null);
      cancelWebTimerNotifications(scheduledWebTimers);
    }

    try {
      if (nextState) {
        await supabase.from('task_completions').upsert({
          user_id: user.id,
          task_id: task.id,
          completion_date: selectedDate,
          completed_value: task.targetValue || 1,
          target_value: task.targetValue || 1,
          is_completed: true,
          completed_at: new Date().toISOString(),
        });
      } else {
        await supabase
          .from('task_completions')
          .delete()
          .eq('task_id', task.id)
          .eq('completion_date', selectedDate);
      }
    } catch (e) {
      // Optimistic update handles UI
    }
  };

  const startBleedingTimer = (task: any) => {
    const durationMins = task.targetValue || 30;
    const totalSecs = durationMins * 60;
    setActiveTimerTask(task);
    setSecondsLeft(totalSecs);
    setIsTimerRunning(true);

    const timers = scheduleWebTimerNotifications(task.name, durationMins);
    setScheduledWebTimers(timers);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
    if (activeTimerTask?.id === taskId) {
      setIsTimerRunning(false);
      setActiveTimerTask(null);
      cancelWebTimerNotifications(scheduledWebTimers);
    }
    try {
      await supabase.from('tasks').update({ status: 'deleted' }).eq('id', taskId);
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center font-sans">
        <div className="text-gray-400 font-semibold animate-pulse">Loading Tasks & Planner...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans flex flex-col">
      <WebNavbar />

      <div className="border-b border-white/10 bg-[#121212]">
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('today')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'today' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Today's Planner
          </button>
          <button
            onClick={() => setActiveSubTab('weekly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'weekly' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Weekly Targets 🗓️
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'history' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Track History 📜
          </button>
        </div>
      </div>

      {activeSubTab === 'today' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-indigo-500/15 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Morning Day Planner 🌅</h1>
              <p className="text-gray-400 text-sm">Simple To-Dos without timing OR Timed Focus tasks with background alarms</p>
            </div>

            <button
              onClick={() => setShowNewTaskModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-sm shadow-lg hover:opacity-95 transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Goal or Task
            </button>
          </div>

          {activeTimerTask && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-pink-900/40 border border-purple-500/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-pink-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Active Bleeding Focus Timer</span>
                </div>
                <span className="text-xs text-gray-400 font-bold">{activeTimerTask.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-5xl font-black font-mono tracking-tight text-white">
                  {formatTime(secondsLeft)}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-1.5"
                  >
                    {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isTimerRunning ? 'Pause' : 'Resume'}
                  </button>

                  <button
                    onClick={() => handleToggleTask(activeTimerTask)}
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-1.5"
                  >
                    <Check className="w-5 h-5" /> Complete Task
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-purple-400" /> Planned Goals & Tasks ({tasks.length})
            </h2>

            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    task.isCompleted
                      ? 'bg-[#121212] border-white/5 opacity-60'
                      : 'bg-[#141414] border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 cursor-pointer" onClick={() => setSelectedTask(task)}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleTask(task); }}
                      className="text-purple-400 hover:scale-110 transition-transform"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-500" />
                      )}
                    </button>

                    <div>
                      <span className={`font-semibold text-base block ${task.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                        {task.name}
                      </span>
                      
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.timerEnabled ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[11px] font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Timed Focus ({task.targetValue} min)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400 text-[11px] font-semibold">
                            🌅 Simple Untimed Goal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details & Timer
                    </button>

                    {task.timerEnabled && !task.isCompleted && (
                      <button
                        onClick={() => startBleedingTimer(task)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-purple-300" /> Start Timer
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center rounded-2xl bg-[#141414] border border-white/10 text-gray-500">
                No tasks planned for today yet. Click <span className="text-purple-400 font-bold">Add Goal or Task</span> above!
              </div>
            )}
          </div>
        </main>
      )}

      {activeSubTab === 'weekly' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-indigo-500/15 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                <Target className="w-6 h-6 text-pink-400" /> Full Weekly Target Planner 🗓️
              </h1>
              <p className="text-gray-400 text-sm">Design your target goals for the week and mark achieved progress step-by-step</p>
            </div>

            <button
              onClick={() => setShowNewWeeklyModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-sm shadow-lg hover:opacity-95 transition-all flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" /> Design Weekly Target
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {weeklyTargets.length > 0 ? (
              weeklyTargets.map((target) => {
                const pct = Math.min(100, Math.round((target.current_amount / target.target_amount) * 100));
                return (
                  <div key={target.id} className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          target.is_achieved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {target.is_achieved ? '🎉 TARGET ACHIEVED' : 'IN PROGRESS'}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-2">{target.title}</h3>
                      </div>

                      <button
                        onClick={() => handleDeleteWeeklyTarget(target.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                        <span>Achieved: {target.current_amount} / {target.target_amount} {target.unit}</span>
                        <span className="text-purple-400 font-bold">{pct}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#1c1c1c] rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleIncrementWeeklyTarget(target)}
                      className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Mark +1 Achieved Progress
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="md:col-span-2 p-12 text-center rounded-2xl bg-[#141414] border border-white/10 text-gray-500">
                No weekly targets designed yet. Click <span className="text-purple-400 font-bold">Design Weekly Target</span> above!
              </div>
            )}
          </div>
        </main>
      )}

      {activeSubTab === 'history' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-6">
          <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                <History className="w-6 h-6 text-purple-400" /> Completion History & Tracking Logs 📜
              </h1>
              <p className="text-gray-400 text-sm">Review your past completed goals and logged focus time</p>
            </div>

            <div className="flex items-center gap-2 bg-[#1c1c1c] px-4 py-2 rounded-xl border border-white/10">
              <CalendarIcon className="w-4 h-4 text-purple-400" />
              <input
                type="date"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
                className="bg-transparent text-sm text-white font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
            <h2 className="text-lg font-bold">
              Completed Tasks on {new Date(historyDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>

            {historyLoading ? (
              <div className="py-8 text-center text-gray-400 animate-pulse">Loading history logs...</div>
            ) : historyTasks.length > 0 ? (
              <div className="space-y-3">
                {historyTasks.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-[#1c1c1c] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="font-semibold text-white block">{item.taskName}</span>
                        <span className="text-xs text-gray-400">
                          {item.timerEnabled ? `⏱️ Timed Focus (${item.targetValue} min)` : '🌅 Simple Untimed Goal'}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Completed at {item.completedAt}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                No task completions recorded on {historyDate}.
              </div>
            )}
          </div>
        </main>
      )}

      {/* NEW WEEKLY TARGET MODAL */}
      {showNewWeeklyModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Design Weekly Target 🗓️</h3>
              <button onClick={() => setShowNewWeeklyModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateWeeklyTarget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Target Title</label>
                <input
                  type="text"
                  required
                  value={newWeeklyTitle}
                  onChange={(e) => setNewWeeklyTitle(e.target.value)}
                  placeholder="e.g. Run 30 km / Read 100 pages / Complete 5 projects"
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Target Amount</label>
                  <input
                    type="number"
                    min={1}
                    value={newWeeklyAmount}
                    onChange={(e) => setNewWeeklyAmount(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Unit</label>
                  <input
                    type="text"
                    value={newWeeklyUnit}
                    onChange={(e) => setNewWeeklyUnit(e.target.value)}
                    placeholder="e.g. km / pages / times"
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewWeeklyModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-sm font-bold text-white shadow-md hover:opacity-95"
                >
                  Save Weekly Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEDICATED TASK DETAIL & TIMER MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute right-5 top-5 p-2 text-gray-400 hover:text-white rounded-full bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider inline-block mb-3">
                {selectedTask.timerEnabled ? '⏱️ Timed Focus Task' : '🌅 Simple Untimed Goal'}
              </span>
              <h2 className="text-2xl font-extrabold text-white mb-1">{selectedTask.name}</h2>
              <p className="text-gray-400 text-sm">
                Target: {selectedTask.timerEnabled ? `${selectedTask.targetValue} Minutes` : '1 Goal Tick'}
              </p>
            </div>

            {selectedTask.timerEnabled ? (
              <div className="p-6 rounded-2xl bg-gradient-to-tr from-purple-950/60 to-indigo-950/60 border border-purple-500/30 text-center space-y-4">
                <div className="text-5xl font-black font-mono tracking-tight text-white">
                  {activeTimerTask?.id === selectedTask.id ? formatTime(secondsLeft) : `${selectedTask.targetValue}:00`}
                </div>
                <p className="text-xs text-purple-300">
                  {activeTimerTask?.id === selectedTask.id ? (isTimerRunning ? '🔥 Timer Bleeding Down Live...' : '⏸️ Timer Paused') : 'Ready to start focus session'}
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  {activeTimerTask?.id === selectedTask.id ? (
                    <>
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md flex items-center gap-2"
                      >
                        {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isTimerRunning ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => handleToggleTask(selectedTask)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Complete Task
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startBleedingTimer(selectedTask)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold text-sm shadow-lg hover:opacity-95 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" /> Start Bleeding Timer
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#1c1c1c] border border-white/5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  {selectedTask.isCompleted ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                </div>
                <h3 className="font-bold text-lg">
                  {selectedTask.isCompleted ? 'Goal Completed 🎉' : 'Goal Pending'}
                </h3>
                <button
                  onClick={() => handleToggleTask(selectedTask)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    selectedTask.isCompleted
                      ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md'
                  }`}
                >
                  {selectedTask.isCompleted ? 'Mark Pending' : 'Mark as Completed ✓'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW TASK CREATION MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Plan New Goal / Task</h3>
              <button onClick={() => setShowNewTaskModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Goal Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Buy groceries / Read 10 pages / Morning Run"
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Select Goal Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTaskMode('todo')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      taskMode === 'todo'
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-[#1c1c1c] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-sm block mb-0.5">🌅 Simple Untimed</span>
                    <span className="text-[11px] text-gray-400 block">No timer. Just tick off when done.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTaskMode('timer')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      taskMode === 'timer'
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-[#1c1c1c] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-sm block mb-0.5">⏱️ Timed Focus</span>
                    <span className="text-[11px] text-gray-400 block">Bleeding timer countdown.</span>
                  </button>
                </div>
              </div>

              {taskMode === 'timer' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Focus Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(Number(e.target.value) || 30)}
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-sm font-bold text-white shadow-md hover:opacity-95"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
