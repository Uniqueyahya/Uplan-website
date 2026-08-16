'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Plus, CheckCircle2, Circle, Trash2, ArrowLeft, LogOut } from 'lucide-react';

export default function WebMarketPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState('Groceries');
  const [loading, setLoading] = useState(true);

  const fetchItems = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('market_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) {
        setItems(data);
      }
    } catch (e) {
      setItems([]);
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
      await fetchItems(u.id);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const activeUser = sessionData?.session?.user || user;
      if (!activeUser?.id) {
        alert('Session expired. Please sign in again.');
        router.replace('/login');
        return;
      }

      const { error } = await supabase.from('market_items').insert([{
        user_id: activeUser.id,
        user_email: activeUser.email,
        name: itemName.trim(),
        quantity: quantity.trim() || '1',
        category,
        is_purchased: false,
      }]);

      if (error) {
        alert('Failed to add market item: ' + error.message);
      } else {
        setItemName('');
        setQuantity('1');
        await fetchItems(activeUser.id);
      }
    } catch (e: any) {
      alert('Error adding item: ' + (e.message || 'Unknown error'));
    }
  };

  const handleTogglePurchased = async (item: any) => {
    const nextState = !item.is_purchased;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_purchased: nextState } : i));

    try {
      await supabase.from('market_items').update({ is_purchased: nextState }).eq('id', item.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    try {
      await supabase.from('market_items').delete().eq('id', itemId);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center font-sans">
        <div className="text-gray-400 font-semibold animate-pulse">Loading Market List...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans flex flex-col">
      <header className="border-b border-white/10 bg-[#141414] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <span className="font-extrabold text-lg tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-400" /> Market Shopping List 🛒
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Add Item Form */}
        <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
          <h2 className="text-lg font-bold">Add Item to Market List</h2>
          <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Sugar / Soap / Milk / Bread"
              className="flex-1 bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Qty (e.g. 2 kg)"
              className="w-full sm:w-32 bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-sm text-white shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </form>
        </div>

        {/* Shopping Items List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Shopping Items ({items.length})
          </h3>

          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  item.is_purchased
                    ? 'bg-[#121212] border-white/5 opacity-60'
                    : 'bg-[#141414] border-white/10 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <button
                    onClick={() => handleTogglePurchased(item)}
                    className="text-purple-400 hover:scale-110 transition-transform"
                  >
                    {item.is_purchased ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-500" />
                    )}
                  </button>
                  <div>
                    <span className={`font-semibold text-base block ${item.is_purchased ? 'line-through text-gray-400' : 'text-white'}`}>
                      {item.name} ({item.quantity})
                    </span>
                    <span className="text-xs text-gray-500">Category: {item.category || 'Groceries'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-12 text-center rounded-2xl bg-[#141414] border border-white/10 text-gray-500">
              Your market shopping list is currently empty. Type an item name above (e.g. Sugar, Soap, Milk) and click <span className="text-purple-400 font-bold">Add Item</span>.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
