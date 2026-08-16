'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import WebNavbar from '@/components/WebNavbar';
import { 
  User, 
  Sun, 
  Moon, 
  Award, 
  Bell, 
  Shield, 
  LogOut, 
  Camera, 
  Check, 
  Lock,
  Sparkles,
  Smartphone
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [taskReminders, setTaskReminders] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        router.replace('/login');
        return;
      }
      const u = sessionData.session.user;
      setUser(u);
      setEmail(u.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || u.user_metadata?.full_name || '');
        setAvatarUrl(profile.avatar_url || '');
      } else {
        setFullName(u.user_metadata?.full_name || u.email?.split('@')[0] || '');
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleSaveAccountSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        email,
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim(),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert('Failed to save profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center font-sans">
        <div className="text-gray-400 font-semibold animate-pulse">Loading Profile Settings...</div>
      </div>
    );
  }

  const isLight = themeMode === 'light';

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080808] text-white'
    }`}>
      <WebNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Profile Avatar & Header Card */}
        <div className={`p-8 rounded-3xl border flex flex-col sm:flex-row items-center gap-6 shadow-xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#141414] border-white/10'
        }`}>
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center font-black text-3xl text-white overflow-hidden shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                fullName ? fullName.slice(0, 2).toUpperCase() : 'UP'
              )}
            </div>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-extrabold mb-1">{fullName || 'Uplan User'}</h1>
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
              Standard Account
            </span>
          </div>
        </div>

        {/* 1. APPEARANCE & MODE SETTINGS */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#141414] border-white/10'
        }`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            {isLight ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-purple-400" />} Appearance & Theme Mode
          </h2>
          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            Switch between dark mode and crisp white mode across your website dashboard.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => setThemeMode('dark')}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                themeMode === 'dark'
                  ? 'bg-purple-600/20 border-purple-500 text-white'
                  : isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#1c1c1c] border-white/10 text-gray-400'
              }`}
            >
              <Moon className="w-6 h-6 text-purple-400" />
              <div>
                <span className="font-bold text-sm block">Dark Mode</span>
                <span className="text-xs opacity-75">Sleek obsidian theme</span>
              </div>
            </button>

            <button
              onClick={() => setThemeMode('light')}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                themeMode === 'light'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-700 font-bold'
                  : 'bg-[#1c1c1c] border-white/10 text-gray-400'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-400" />
              <div>
                <span className="font-bold text-sm block">White Mode</span>
                <span className="text-xs opacity-75">Clean light theme</span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. ACCOUNT SETTINGS */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#141414] border-white/10'
        }`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" /> Account Settings
          </h2>

          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
              <Check className="w-5 h-5" /> Account settings updated successfully!
            </div>
          )}

          <form onSubmit={handleSaveAccountSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 opacity-70">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#1c1c1c] border-white/10 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 opacity-70">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#1c1c1c] border-white/10 text-white'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-sm text-white shadow-md hover:opacity-95 transition-all"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* 3. ACHIEVEMENTS */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#141414] border-white/10'
        }`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Achievements & Unlocked Badges
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1c1c1c] border-white/5'
            }`}>
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                🔥
              </div>
              <div>
                <span className="font-bold text-sm block">Streak Master</span>
                <span className="text-xs opacity-60">Completed 3 daily streaks</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1c1c1c] border-white/5'
            }`}>
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
                🎯
              </div>
              <div>
                <span className="font-bold text-sm block">Goal Champion</span>
                <span className="text-xs opacity-60">Created 5 task goals</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1c1c1c] border-white/5'
            }`}>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                ⏱️
              </div>
              <div>
                <span className="font-bold text-sm block">Focus Warrior</span>
                <span className="text-xs opacity-60">Completed 30 min timer</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. NOTIFICATIONS */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#141414] border-white/10'
        }`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" /> Notifications & Alarms
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <span className="font-semibold text-sm block">Task Reminders & 5-Min Alarm</span>
                <span className="text-xs opacity-60">Receive background alarms when task remains 5 minutes</span>
              </div>
              <input
                type="checkbox"
                checked={taskReminders}
                onChange={(e) => setTaskReminders(e.target.checked)}
                className="w-5 h-5 accent-purple-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <span className="font-semibold text-sm block">Streak Daily Reminder</span>
                <span className="text-xs opacity-60">Daily reminder at 8 PM to keep your streak active</span>
              </div>
              <input
                type="checkbox"
                checked={streakReminders}
                onChange={(e) => setStreakReminders(e.target.checked)}
                className="w-5 h-5 accent-purple-500"
              />
            </div>
          </div>
        </div>

        {/* 5. PRIVACY & DATA */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#141414] border-white/10'
        }`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" /> Privacy & Data
          </h2>

          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            Your data is stored securely in Supabase with Row Level Security.
          </p>

          <button
            onClick={handleSignOut}
            className="w-full py-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out of Uplan Web
          </button>
        </div>
      </main>
    </div>
  );
}
