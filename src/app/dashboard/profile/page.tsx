'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import WebNavbar from '@/components/WebNavbar';
import { useThemeContext } from '@/context/ThemeContext';
import { 
  User, 
  Sun, 
  Moon, 
  Award, 
  Bell, 
  Shield, 
  LogOut, 
  Check, 
  Sparkles,
  Camera,
  Upload
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useThemeContext();
  const isLight = theme === 'light';

  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [taskReminders, setTaskReminders] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // Fallback: convert to base64 data URL if storage bucket doesn't exist
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          setAvatarUrl(dataUrl);

          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            avatar_url: dataUrl,
          });
        };
        reader.readAsDataURL(file);
      } else {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;
        setAvatarUrl(publicUrl);

        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          avatar_url: publicUrl,
        });
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveAccountSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const cleanName = fullName.trim();
      const cleanAvatar = avatarUrl.trim();

      // 1. Update Supabase Auth User metadata
      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: cleanName, avatar_url: cleanAvatar }
      });

      if (authErr) {
        console.warn('Auth metadata update warning:', authErr.message);
      }

      // 2. Upsert into public.profiles table
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: cleanName,
        avatar_url: cleanAvatar,
        updated_at: new Date().toISOString(),
      });

      if (profileErr) {
        setSaveError('Failed to save profile: ' + profileErr.message);
        return;
      }

      setUser((prev: any) => ({
        ...prev,
        user_metadata: { ...prev?.user_metadata, full_name: cleanName, avatar_url: cleanAvatar }
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e: any) {
      setSaveError('Error updating profile: ' + (e.message || 'Unknown error'));
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
      <div className={`min-h-screen flex items-center justify-center font-sans ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080808] text-white'}`}>
        <div className="font-semibold animate-pulse opacity-70">Loading Profile Settings...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080808] text-white'
    }`}>
      <WebNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 sm:pb-12 space-y-6 sm:space-y-8">
        {/* Profile Header */}
        <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col sm:flex-row items-center gap-6 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'
        }`}>
          <div className="relative group">
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <label htmlFor="avatar-upload" className="cursor-pointer block">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center font-extrabold text-2xl text-white shadow-lg overflow-hidden border-2 border-purple-500/50">
                {avatarUploading ? (
                  <div className="animate-spin w-8 h-8 border-3 border-white border-t-transparent rounded-full" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  fullName ? fullName.slice(0, 2).toUpperCase() : 'UP'
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </label>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-extrabold mb-1">{fullName || 'Uplan User'}</h1>
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
              Standard Account
            </span>
          </div>
        </div>

        {/* 1. APPEARANCE & THEME MODE SETTINGS */}
        <div className={`p-6 rounded-2xl border space-y-4 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'
        }`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            {isLight ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-purple-400" />} Appearance & System Theme
          </h2>
          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            Click White Mode or Dark Mode below to instantly change the theme across the entire Uplan website.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                theme === 'dark'
                  ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                  : isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-[#1c1c1c] border-white/10 text-gray-400'
              }`}
            >
              <Moon className="w-6 h-6 text-purple-400" />
              <div>
                <span className="font-bold text-sm block">Dark Mode</span>
                <span className="text-xs opacity-75">Sleek obsidian theme</span>
              </div>
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                theme === 'light'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-800 font-bold'
                  : 'bg-[#1c1c1c] border-white/10 text-gray-400 hover:bg-[#242424]'
              }`}
            >
              <Sun className="w-6 h-6 text-amber-500" />
              <div>
                <span className="font-bold text-sm block">White Mode</span>
                <span className="text-xs opacity-75">Clean light theme</span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. ACCOUNT SETTINGS & NAME EDITING */}
        <div className={`p-6 rounded-2xl border space-y-4 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'
        }`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-purple-500" /> Edit Profile & Account Name
          </h2>

          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" /> Profile name updated successfully!
            </div>
          )}

          {saveError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSaveAccountSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 opacity-70">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#1c1c1c] border-white/10 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 opacity-70">Profile Picture</label>
              <label
                htmlFor="avatar-upload-form"
                className={`flex items-center gap-3 w-full border rounded-xl px-4 py-2.5 text-sm cursor-pointer transition-all ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-[#1c1c1c] border-white/10 text-gray-300 hover:bg-[#242424]'
                }`}
              >
                <Upload className="w-4 h-4 text-purple-500" />
                {avatarUrl ? 'Change profile picture...' : 'Choose a profile picture from your device...'}
              </label>
              <input
                type="file"
                id="avatar-upload-form"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-sm text-white shadow-md hover:opacity-95 transition-all"
            >
              {saving ? 'Saving Name...' : 'Save Profile Name & Settings'}
            </button>
          </form>
        </div>

        {/* 3. ACHIEVEMENTS */}
        <div className={`p-6 rounded-2xl border space-y-4 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'
        }`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Achievements & Badges
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1c1c1c] border-white/5'
            }`}>
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-xl">
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
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-xl">
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
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xl">
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
        <div className={`p-6 rounded-2xl border space-y-4 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'
        }`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" /> Notifications & Alarms
          </h2>

          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
            }`}>
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

            <div className={`flex items-center justify-between p-3 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
            }`}>
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

        {/* 5. PRIVACY & SIGN OUT */}
        <div className={`p-6 rounded-2xl border space-y-4 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'
        }`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" /> Privacy & Data
          </h2>

          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            Your data is stored securely in Supabase with Row Level Security.
          </p>

          <button
            onClick={handleSignOut}
            className="w-full py-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out of Uplan Web
          </button>
        </div>
      </main>
    </div>
  );
}
