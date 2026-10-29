'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { CategoryBadge } from './CategoryBadge';
import { Calculator, Plus, AlertCircle, CheckCircle } from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const { categories, transactions, budgets, addBudget, defaultCurrency } = useApp();

  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [limitAmount, setLimitAmount] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(limitAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    addBudget({
      category_id: selectedCategoryId,
      amount_limit: parsed,
      month: '2026-10',
      currency: defaultCurrency,
    });

    setLimitAmount('');
    setIsAddBudgetOpen(false);
  };

  return (
    <div className="pb-24 max-w-4xl mx-auto px-4 pt-3 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            Monthly Spending Budgets
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set and track spending limits for each category in October 2026
          </p>
        </div>

        <button
          onClick={() => setIsAddBudgetOpen(true)}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Set Budget
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expenseCategories.map((cat) => {
          const budget = budgets.find((b) => b.category_id === cat.id);
          const limit = budget?.amount_limit || cat.budget_limit || 0;

          const catTransactions = transactions.filter(
            (t) => t.category_id === cat.id && t.type === 'expense'
          );
          const totalSpent = catTransactions.reduce((sum, t) => sum + t.amount, 0);

          const remaining = limit > 0 ? limit - totalSpent : 0;
          const percent = limit > 0 ? Math.min(100, Math.round((totalSpent / limit) * 100)) : 0;
          const isOverBudget = limit > 0 && totalSpent > limit;

          return (
            <div
              key={cat.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <CategoryBadge category={cat} size="lg" />
                <div className="text-right">
                  <div className="text-xs text-slate-400">Limit</div>
                  <div className="text-sm font-extrabold font-mono text-slate-200">
                    {limit > 0 ? `${limit.toFixed(2)} ${defaultCurrency}` : 'No limit set'}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {limit > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">
                      Spent: <strong className="text-white">{totalSpent.toFixed(2)} {defaultCurrency}</strong>
                    </span>
                    <span className={isOverBudget ? 'text-rose-400' : 'text-slate-400'}>
                      {remaining >= 0
                        ? `${remaining.toFixed(2)} ${defaultCurrency} left`
                        : `${Math.abs(remaining).toFixed(2)} ${defaultCurrency} OVER`}
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget
                          ? 'bg-rose-500'
                          : percent >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>{percent}% consumed</span>
                    {isOverBudget ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Over Budget
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> On Track
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2 italic text-center bg-slate-950/40 rounded-xl">
                  No spending budget configured for this category yet.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      {isAddBudgetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Set Category Budget</h3>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Category</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Monthly Limit Amount ({defaultCurrency})
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder="e.g. 300"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-lg font-bold font-mono text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBudgetOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
