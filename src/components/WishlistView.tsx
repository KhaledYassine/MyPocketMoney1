'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { CategoryBadge } from './CategoryBadge';
import { AccountChip } from './AccountChip';
import {
  CheckSquare,
  Plus,
  ShoppingCart,
  Trash2,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

export const WishlistView: React.FC = () => {
  const {
    plannedBuys,
    addPlannedBuy,
    convertPlannedBuyToTransaction,
    deletePlannedBuy,
    categories,
    accounts,
    defaultCurrency,
  } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState(accounts[0]?.id || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');

  const activeItems = plannedBuys.filter((i) => !i.is_purchased);
  const purchasedItems = plannedBuys.filter((i) => i.is_purchased);

  const totalPlannedCost = activeItems.reduce((acc, i) => acc + i.estimated_cost, 0);

  const handleCreatePlannedBuy = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCost = parseFloat(estimatedCost);
    if (!title.trim() || isNaN(parsedCost)) return;

    addPlannedBuy({
      title,
      estimated_cost: parsedCost,
      currency: defaultCurrency,
      category_id: categoryId,
      target_account_id: targetAccountId,
      priority,
      notes,
    });

    setTitle('');
    setEstimatedCost('');
    setNotes('');
    setIsAddOpen(false);
  };

  return (
    <div className="pb-24 max-w-4xl mx-auto px-4 pt-3 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-white">Planned Purchases & Thought List</h2>
          </div>
          <p className="text-xs text-slate-400">
            Write down your wishlist thoughts and convert them into actual expenses when bought
          </p>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-right w-full sm:w-auto">
          <div className="text-xs text-slate-400 font-medium">Estimated Wishlist Cost</div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {totalPlannedCost.toFixed(2)} <span className="text-xs text-slate-300">{defaultCurrency}</span>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Ideas & Planned Items ({activeItems.length})
        </h3>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Planned Item
        </button>
      </div>

      {/* Active Planned List */}
      <div className="space-y-3">
        {activeItems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
            Your wishlist is empty. Write down your purchase ideas here!
          </div>
        ) : (
          activeItems.map((item) => {
            const targetAccount = accounts.find((a) => a.id === item.target_account_id);

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        item.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : item.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {item.priority} priority
                    </span>
                    <h4 className="text-base font-bold text-white">{item.title}</h4>
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                    {item.category_id && <CategoryBadge categoryId={item.category_id} size="sm" />}
                    {targetAccount && <AccountChip account={targetAccount} size="sm" />}
                    {item.notes && <span className="text-slate-400 italic">&quot;{item.notes}&quot;</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                  <div className="text-base font-black font-mono text-amber-400">
                    {item.estimated_cost.toFixed(2)} {item.currency}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        convertPlannedBuyToTransaction(
                          item.id,
                          item.target_account_id || accounts[0]?.id
                        )
                      }
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                      title="Mark as Bought & Record Expense"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Buy Now
                    </button>

                    <button
                      onClick={() => deletePlannedBuy(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Purchased Items History */}
      {purchasedItems.length > 0 && (
        <div className="pt-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Purchased History ({purchasedItems.length})
          </h3>

          <div className="space-y-2">
            {purchasedItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400 opacity-80"
              >
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span className="line-through font-semibold text-slate-300">{item.title}</span>
                </div>
                <div className="font-mono font-bold text-slate-400">
                  {item.estimated_cost.toFixed(2)} {item.currency}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" /> Add Thought / Planned Buy
            </h3>

            <form onSubmit={handleCreatePlannedBuy} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Headphones, Winter Jacket..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Estimated Cost ({defaultCurrency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Target Account</label>
                  <select
                    value={targetAccountId}
                    onChange={(e) => setTargetAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Notes & Thoughts</label>
                <textarea
                  placeholder="Why do you want to buy this? Features to consider..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Save Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
