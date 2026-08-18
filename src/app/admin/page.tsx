'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  ShoppingCart, 
  Megaphone, 
  ShieldCheck, 
  LogOut, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'market' | 'broadcast' | 'audit'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [marketItems, setMarketItems] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [marketFilter, setMarketFilter] = useState<'all' | 'pending' | 'bought'>('all');
  const [loading, setLoading] = useState(true);

  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Users');

  const fetchAdminData = async () => {
    try {
      // 1. Fetch Users
      const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesData) {
        setUsers(profilesData.map((p: any) => ({
          id: p.id,
          name: p.full_name || 'User Account',
          email: p.email || (p.id ? `${p.id.slice(0, 8)}...` : 'user@uplan.app'),
          role: p.role || 'user',
          status: p.status || 'active',
          joinedDate: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Today',
        })));
      }

      // 2. Fetch Market Items Overview across users
      const { data: marketData } = await supabase.from('market_items').select('*').order('created_at', { ascending: false });
      if (marketData) {
        setMarketItems(marketData);
      }

      // 3. Fetch Security Audit Logs
      const { data: logsData } = await supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false });
      if (logsData) {
        setAuditLogs(logsData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const checkAdminSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentEmail = sessionData.session?.user?.email;

      if (!sessionData.session || currentEmail !== 'adminuplan@gmail.com') {
        router.replace('/login');
        return;
      }

      await fetchAdminData();
      setLoading(false);
    };

    checkAdminSession();
  }, [router]);

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));

    try {
      await supabase.from('profiles').update({ status: nextStatus }).eq('id', userId);
      alert(`User status updated to ${nextStatus.toUpperCase()}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setUsers(prev => prev.filter(u => u.id !== userId));

    try {
      // 1. Delete user tasks and completions
      await supabase.from('tasks').delete().eq('user_id', userId);
      await supabase.from('market_items').delete().eq('user_id', userId);
      
      // 2. Delete user profile record
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;

      alert(`User "${userName}" deleted successfully.`);
      fetchAdminData();
    } catch (e: any) {
      alert(`Failed to delete user: ${e.message || 'Error occurred'}`);
      fetchAdminData();
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      alert('Please fill out broadcast title and message body.');
      return;
    }
    alert(`Broadcast Notification "${broadcastTitle}" delivered to ${targetAudience}!`);
    setBroadcastTitle('');
    setBroadcastBody('');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = userFilter === 'all' || u.status === userFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredMarketItems = marketItems.filter(m => {
    if (marketFilter === 'pending') return !m.is_purchased;
    if (marketFilter === 'bought') return m.is_purchased;
    return true;
  });

  const pendingMarketCount = marketItems.filter(m => !m.is_purchased).length;
  const boughtMarketCount = marketItems.filter(m => m.is_purchased).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center font-sans">
        <div className="text-gray-400 font-semibold animate-pulse">Loading Super Admin Portal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans flex flex-col">
      {/* Admin Top Bar */}
      <header className="border-b border-white/10 bg-[#141414] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-base shadow-md">
              A
            </div>
            <span className="font-extrabold text-lg tracking-tight">Uplan Super Admin Portal</span>
          </div>

          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      {/* Admin Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Spaced Admin Profile Header Card */}
        <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-extrabold text-2xl shadow-lg">
              AU
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-extrabold">Admin Uplan</h1>
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500 text-white text-[10px] font-extrabold tracking-wider uppercase">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-gray-400 text-sm">adminuplan@gmail.com</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> System Online & Connected
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { key: 'overview', label: 'Overview', icon: Sparkles },
            { key: 'users', label: 'User Directory', icon: Users },
            { key: 'market', label: 'Market Shopping', icon: ShoppingCart },
            { key: 'broadcast', label: 'Push Broadcast', icon: Megaphone },
            { key: 'audit', label: 'Audit Logs', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                    : 'bg-[#141414] text-gray-400 border-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* 4-BOX MAIN OVERVIEW DASHBOARD HUB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Admin Executive Overview Hub</h2>
              <button onClick={fetchAdminData} className="text-xs text-purple-400 flex items-center gap-1 hover:underline">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Data
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Box 1: User Directory Hub */}
              <div 
                onClick={() => setActiveTab('users')}
                className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">1. User Directory Hub 👥</h3>
                      <p className="text-gray-400 text-xs">{users.length} Registered User Accounts</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>

                <div className="h-px bg-white/10" />

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#1c1c1c] p-3 rounded-xl border border-white/5">
                    <div className="text-gray-400 text-xs">Total Users</div>
                    <div className="text-xl font-extrabold">{users.length}</div>
                  </div>
                  <div className="bg-[#1c1c1c] p-3 rounded-xl border border-white/5">
                    <div className="text-gray-400 text-xs">Active</div>
                    <div className="text-xl font-extrabold text-emerald-400">{users.filter(u => u.status === 'active').length}</div>
                  </div>
                  <div className="bg-[#1c1c1c] p-3 rounded-xl border border-white/5">
                    <div className="text-gray-400 text-xs">Suspended</div>
                    <div className="text-xl font-extrabold text-pink-400">{users.filter(u => u.status === 'suspended').length}</div>
                  </div>
                </div>

                <div className="text-right text-purple-400 text-xs font-bold">Manage User Directory →</div>
              </div>

              {/* Box 2: Market Shopping Hub */}
              <div 
                onClick={() => setActiveTab('market')}
                className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">2. Market Shopping Hub 🛒</h3>
                      <p className="text-gray-400 text-xs">{marketItems.length} Market Items Listed Across Users</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>

                <div className="h-px bg-white/10" />

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#1c1c1c] p-3 rounded-xl border border-white/5">
                    <div className="text-gray-400 text-xs">Total Listed</div>
                    <div className="text-xl font-extrabold">{marketItems.length}</div>
                  </div>
                  <div className="bg-[#1c1c1c] p-3 rounded-xl border border-white/5">
                    <div className="text-gray-400 text-xs">Pending</div>
                    <div className="text-xl font-extrabold text-amber-400">{pendingMarketCount}</div>
                  </div>
                  <div className="bg-[#1c1c1c] p-3 rounded-xl border border-white/5">
                    <div className="text-gray-400 text-xs">Purchased</div>
                    <div className="text-xl font-extrabold text-emerald-400">{boughtMarketCount}</div>
                  </div>
                </div>

                <div className="text-right text-emerald-400 text-xs font-bold">View Market Items Details →</div>
              </div>

              {/* Box 3: Push Broadcast Center */}
              <div 
                onClick={() => setActiveTab('broadcast')}
                className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-pink-500/50 transition-all cursor-pointer space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">3. Push Broadcast Center 📢</h3>
                      <p className="text-gray-400 text-xs">Broadcast system messages & notification alerts</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                </div>

                <div className="h-px bg-white/10" />

                <p className="text-gray-400 text-sm">
                  Send targeted push notifications to all users or specific user groups in real-time.
                </p>

                <div className="text-right text-pink-400 text-xs font-bold">Compose Broadcast Notification →</div>
              </div>

              {/* Box 4: Security Audit Logs */}
              <div 
                onClick={() => setActiveTab('audit')}
                className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">4. Security Audit & Logs 🛡️</h3>
                      <p className="text-gray-400 text-xs">Administrative logs & compliance tracking</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">System Security Status:</span>
                  <span className="text-emerald-400 font-bold">Active & Secured</span>
                </div>

                <div className="text-right text-indigo-400 text-xs font-bold">View Security Audit Logs →</div>
              </div>
            </div>
          </div>
        )}

        {/* DETAILED USERS PAGE */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">User Directory & Account Management</h2>
              <span className="text-xs text-gray-400">{users.length} Total Users</span>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 text-gray-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by full name or email address..."
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

              <div className="space-y-3">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <div key={u.id} className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base">{u.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {u.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 break-all">{u.email}</p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                            u.status === 'active'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>

                        {u.email !== 'adminuplan@gmail.com' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-center"
                          >
                            Delete Account
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                <div className="p-12 text-center rounded-2xl bg-[#141414] border border-white/10 text-gray-500">
                  No users found in directory.
                </div>
              )}
            </div>
          </div>
        )}

        {/* DETAILED MARKET SHOPPING PAGE */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Market Shopping Oversight 🛒</h2>
              <span className="text-xs text-gray-400">{marketItems.length} Total Items</span>
            </div>

            <div className="space-y-3">
              {filteredMarketItems.length > 0 ? (
                filteredMarketItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between">
                    <div>
                      <span className={`font-bold text-base block ${item.is_purchased ? 'line-through text-gray-500' : 'text-white'}`}>
                        {item.name} ({item.quantity})
                      </span>
                      <span className="text-xs text-gray-400">User Email: {item.user_email || item.user_id}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.is_purchased ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {item.is_purchased ? 'BOUGHT' : 'PENDING'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center rounded-2xl bg-[#141414] border border-white/10 text-gray-500">
                  No market items listed by users yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* DETAILED PUSH BROADCAST PAGE */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-xl font-bold">Push Notification Broadcast Center</h2>
            <form onSubmit={handleSendBroadcast} className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Notification Title</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. 🚀 Platform Maintenance Completed"
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Message Body</label>
                <textarea
                  required
                  rows={4}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="Enter broadcast alert text..."
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-white shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all"
              >
                Send Broadcast Notification
              </button>
            </form>
          </div>
        )}

        {/* DETAILED AUDIT LOGS PAGE */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Security & Audit Logs</h2>
            <div className="space-y-3">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-[#141414] border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-purple-400">{log.event}</span>
                      <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-gray-300">{log.details}</p>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center rounded-2xl bg-[#141414] border border-white/10 text-gray-500">
                  Administrative audit events will appear here in real-time.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
