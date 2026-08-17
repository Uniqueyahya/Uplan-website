'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import WebNavbar from '@/components/WebNavbar';
import { useThemeContext } from '@/context/ThemeContext';
import { ShoppingCart, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';

export default function MarketPage() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const isLight = theme === 'light';

  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState('Groceries');
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

      const { data } = await supabase
        .from('market_items')
        .select('*')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });

      if (data) {
        setItems(data);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user?.id) return;

    const newItem = {
      user_id: user.id,
      name: name.trim(),
      quantity: parseInt(quantity) || 1,
      unit,
      category,
      is_purchased: false,
    };

    try {
      const { data, error } = await supabase
        .from('market_items')
        .insert([newItem])
        .select()
        .single();

      if (!error && data) {
        setItems(prev => [data, ...prev]);
        setName('');
        setQuantity('1');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleItem = async (item: any) => {
    const nextPurchased = !item.is_purchased;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_purchased: nextPurchased } : i));

    try {
      await supabase
        .from('market_items')
        .update({ is_purchased: nextPurchased })
        .eq('id', item.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      await supabase.from('market_items').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080808] text-white'}`}>
        <div className="font-semibold animate-pulse opacity-70">Loading Market Shopping List...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#080808] text-white'
    }`}>
      <WebNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-8">
        <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
          isLight 
            ? 'bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-slate-200 shadow-sm' 
            : 'bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-indigo-500/15 border-white/10'
        }`}>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
              <ShoppingCart className="w-6 h-6 text-pink-500" /> Digital Market Shopping List 🛒
            </h1>
            <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Plan what to buy (Sugar, Soap, Milk, Groceries) instead of paper notes.
            </p>
          </div>
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'
        }`}>
          <h2 className="text-lg font-bold">Add Item to Market List</h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold opacity-70 mb-1 uppercase">Item Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sugar, Soap, Groceries, Milk"
                className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#1c1c1c] border-white/10 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold opacity-70 mb-1 uppercase">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#1c1c1c] border-white/10 text-white'
                }`}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-bold text-sm text-white shadow-md hover:opacity-95 flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>
        </form>

        {/* Market Items List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Your Shopping Items ({items.length})</h2>

          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  item.is_purchased
                    ? isLight ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-[#121212] border-white/5 opacity-60'
                    : isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#141414] border-white/10'
                }`}
              >
                <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => handleToggleItem(item)}>
                  <button className="text-purple-500">
                    {item.is_purchased ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </button>

                  <div>
                    <span className={`font-semibold text-base block ${
                      item.is_purchased 
                        ? 'line-through text-gray-400' 
                        : isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {item.name}
                    </span>
                    <span className="text-xs text-purple-600 font-bold">
                      {item.quantity} {item.unit} • {item.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className={`p-12 text-center rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#141414] border-white/10 text-gray-500'
            }`}>
              No market shopping items added yet. Add sugar, soap, or groceries above!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
