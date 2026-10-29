'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { AddSharedExpenseModal } from './AddSharedExpenseModal';
import { SettleUpModal } from './SettleUpModal';
import {
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  Receipt,
  UserPlus,
} from 'lucide-react';

export const TricountView: React.FC = () => {
  const {
    tricounts,
    addTricountGroup,
    calculateMemberBalance,
    setSelectedTricountId,
    defaultCurrency,
    sharedExpenses,
  } = useApp();

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [activeGroupForExpense, setActiveGroupForExpense] = useState<string>('');

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('Travel');
  const [memberNamesInput, setMemberNamesInput] = useState('Anes, Youssef, Eya');

  // Calculate my total net balance across all tricounts
  const myTotalTricountBalance = tricounts.reduce((sum, g) => {
    return sum + calculateMemberBalance(g.id, 'mem-you');
  }, 0);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) return;

    const extraMembers = memberNamesInput
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .map((name, idx) => ({
        id: `mem-${Date.now()}-${idx}`,
        name,
        color: ['#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'][idx % 5],
      }));

    addTricountGroup({
      title: newGroupTitle,
      category: newGroupCategory,
      currency: defaultCurrency,
      created_by: 'mem-you',
      members: [
        { id: 'mem-you', name: 'You (Me)', email: 'me@example.com', color: '#10B981' },
        ...extraMembers,
      ],
    });

    setNewGroupTitle('');
    setIsCreateGroupOpen(false);
  };

  return (
    <div className="pb-24 max-w-4xl mx-auto px-4 pt-3 space-y-6">
      {/* 1. Tricount Net Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-white">Tricount Group Expense Splitter</h2>
          </div>
          <p className="text-xs text-slate-400">
            Share costs with friends, track who owes who, and settle debt seamlessly
          </p>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-right w-full sm:w-auto">
          <div className="text-xs text-slate-400 font-medium">Your Net Tricount Position</div>
          <div
            className={`text-2xl font-black font-mono ${
              myTotalTricountBalance > 0
                ? 'text-emerald-400'
                : myTotalTricountBalance < 0
                ? 'text-rose-400'
                : 'text-slate-300'
            }`}
          >
            {myTotalTricountBalance > 0 ? '+' : ''}
            {myTotalTricountBalance.toFixed(2)}{' '}
            <span className="text-xs font-semibold">{defaultCurrency}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {myTotalTricountBalance > 0
              ? 'You are owed money overall'
              : myTotalTricountBalance < 0
              ? 'You owe money overall'
              : 'All groups are settled'}
          </div>
        </div>
      </div>

      {/* Top Action Buttons */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          My Shared Tricounts ({tricounts.length})
        </h3>

        <button
          onClick={() => setIsCreateGroupOpen(true)}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Tricount
        </button>
      </div>

      {/* Tricount Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tricounts.map((group) => {
          const myBalance = calculateMemberBalance(group.id, 'mem-you');
          const groupExpenses = sharedExpenses.filter((e) => e.tricount_id === group.id);
          const totalGroupSpend = groupExpenses.reduce((sum, e) => sum + e.amount, 0);

          const isOwed = myBalance > 0;
          const isOwing = myBalance < 0;

          return (
            <div
              key={group.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-4 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {group.category}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-1">{group.title}</h4>
                  </div>

                  {/* My Status Badge */}
                  <div
                    className={`px-2.5 py-1 rounded-xl text-xs font-extrabold font-mono flex items-center gap-1 ${
                      isOwed
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : isOwing
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isOwed && <TrendingUp className="w-3.5 h-3.5" />}
                    {isOwing && <TrendingDown className="w-3.5 h-3.5" />}
                    {!isOwed && !isOwing && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>
                      {isOwed ? `+${myBalance.toFixed(2)}` : myBalance.toFixed(2)}{' '}
                      {group.currency}
                    </span>
                  </div>
                </div>

                {group.description && (
                  <p className="text-xs text-slate-400 mb-3">{group.description}</p>
                )}

                {/* Member Avatars Bar */}
                <div className="flex items-center justify-between py-2 border-y border-slate-800/80 my-3">
                  <div className="flex items-center -space-x-2">
                    {group.members.slice(0, 5).map((m) => (
                      <div
                        key={m.id}
                        className="w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-[10px] text-white"
                        style={{ backgroundColor: m.color || '#10B981' }}
                        title={m.name}
                      >
                        {m.name.substring(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {group.members.length > 5 && (
                      <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 text-slate-300 font-bold text-[10px] flex items-center justify-center">
                        +{group.members.length - 5}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    <span>Total: <strong className="text-slate-200 font-mono">{totalGroupSpend.toFixed(2)} {group.currency}</strong></span>
                  </div>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => setSelectedTricountId(group.id)}
                  className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setActiveGroupForExpense(group.id);
                    setIsAddExpenseOpen(true);
                  }}
                  className="py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Expense
                </button>

                <button
                  onClick={() => {
                    setActiveGroupForExpense(group.id);
                    setIsSettleOpen(true);
                  }}
                  className="py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Settle
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <AddSharedExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        defaultTricountId={activeGroupForExpense}
      />

      <SettleUpModal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        tricountId={activeGroupForExpense}
      />

      {/* Create New Tricount Group Modal */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              Create New Tricount Group
            </h3>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Group Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Summer Vacation, Coloc Rent, Roadtrip..."
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Travel">Travel / Trip</option>
                  <option value="House">House / Coloc</option>
                  <option value="Event">Event / Party</option>
                  <option value="Couple">Couple / Partners</option>
                  <option value="General">General Shared</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Friends / Participants (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Anes, Youssef, Eya, Ahmed..."
                  value={memberNamesInput}
                  onChange={(e) => setMemberNamesInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
