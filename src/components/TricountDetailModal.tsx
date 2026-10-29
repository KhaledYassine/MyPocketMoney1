'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { X, Users, DollarSign, Receipt, Plus } from 'lucide-react';

interface TricountDetailModalProps {
  onOpenAddExpense?: () => void;
}

export const TricountDetailModal: React.FC<TricountDetailModalProps> = ({
  onOpenAddExpense,
}) => {
  const {
    tricounts,
    selectedTricountId,
    setSelectedTricountId,
    sharedExpenses,
    calculateMemberBalance,
  } = useApp();

  if (!selectedTricountId) return null;

  const group = tricounts.find((g) => g.id === selectedTricountId);
  if (!group) return null;

  const expenses = sharedExpenses.filter((e) => e.tricount_id === group.id);
  const totalGroupSpend = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Determine who owes whom pairwise
  const memberBalances = group.members.map((m) => ({
    member: m,
    balance: calculateMemberBalance(group.id, m.id),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 relative bg-gradient-to-r from-emerald-900/40 via-slate-900 to-slate-900 border-b border-slate-800">
          <button
            onClick={() => setSelectedTricountId(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/60 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {group.category} Tricount
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white">{group.title}</h2>
          {group.description && <p className="text-xs text-slate-400 mt-1">{group.description}</p>}

          <div className="mt-4 flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Total Spent</div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {totalGroupSpend.toFixed(2)} {group.currency}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{group.members.length} Participants</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* Member Balances Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Balances & Who Owes Who
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {memberBalances.map(({ member, balance }) => {
                const isPositive = balance > 0;
                const isNegative = balance < 0;

                return (
                  <div
                    key={member.id}
                    className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                        style={{ backgroundColor: member.color || '#10B981' }}
                      >
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-200">{member.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {isPositive ? 'Should receive' : isNegative ? 'Owes' : 'Settled up'}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-sm font-bold font-mono ${
                        isPositive
                          ? 'text-emerald-400'
                          : isNegative
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {balance.toFixed(2)} {group.currency}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shared Expenses Feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-slate-400" />
                Group Expenses ({expenses.length})
              </h3>
            </div>

            {expenses.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                No shared expenses added yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {expenses.map((exp) => {
                  const payer = group.members.find((m) => m.id === exp.paid_by_member_id);
                  return (
                    <div
                      key={exp.id}
                      className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-200">{exp.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Paid by <strong className="text-slate-300">{payer?.name || 'Someone'}</strong> on{' '}
                          {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      <div className="text-sm font-bold font-mono text-emerald-400">
                        {exp.amount.toFixed(2)} {exp.currency}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setSelectedTricountId(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors"
          >
            Close
          </button>

          {onOpenAddExpense && (
            <button
              onClick={() => {
                setSelectedTricountId(null);
                onOpenAddExpense();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Shared Expense
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
