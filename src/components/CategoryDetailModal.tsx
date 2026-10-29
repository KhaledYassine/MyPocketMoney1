'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Icon } from './Icon';
import { AccountChip } from './AccountChip';
import { X, PieChart } from 'lucide-react';

export const CategoryDetailModal: React.FC = () => {
  const { categories, selectedCategoryId, setSelectedCategoryId, transactions, budgets, defaultCurrency } =
    useApp();

  if (!selectedCategoryId) return null;

  const category = categories.find((c) => c.id === selectedCategoryId);
  if (!category) return null;

  const categoryTransactions = transactions.filter((tx) => tx.category_id === category.id);
  const totalSpent = categoryTransactions.reduce((acc, tx) => acc + tx.amount, 0);

  const budget = budgets.find((b) => b.category_id === category.id);
  const budgetLimit = budget?.amount_limit || category.budget_limit || 0;
  const percentUsed = budgetLimit > 0 ? Math.min(100, Math.round((totalSpent / budgetLimit) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div
          className="p-6 relative text-white flex flex-col justify-between"
          style={{
            background: `linear-gradient(135deg, ${category.color}30 0%, ${category.color}10 100%)`,
            borderBottom: `1px solid ${category.color}30`,
          }}
        >
          <button
            onClick={() => setSelectedCategoryId(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/60 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: category.color }}
            >
              <Icon name={category.icon || 'Tag'} className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-75 text-slate-300">
                {category.type} Category
              </span>
              <h2 className="text-2xl font-bold text-white">{category.name}</h2>
            </div>
          </div>

          {/* Budget progress indicator */}
          {category.type === 'expense' && budgetLimit > 0 && (
            <div className="mt-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>
                  Spent: <strong className="text-white">{totalSpent.toFixed(2)} {defaultCurrency}</strong>
                </span>
                <span>
                  Limit: <strong className="text-slate-400">{budgetLimit.toFixed(2)} {defaultCurrency}</strong> ({percentUsed}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    percentUsed >= 100
                      ? 'bg-rose-500'
                      : percentUsed >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Subcategories list if any */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/30">
            <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Subcategories
            </div>
            <div className="flex flex-wrap gap-1.5">
              {category.subcategories.map((sub) => (
                <span
                  key={sub.id}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 font-medium"
                >
                  {sub.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Transactions */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-slate-400" />
              Category Activity ({categoryTransactions.length})
            </h3>
          </div>

          {categoryTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No transactions recorded in this category yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {categoryTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{tx.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">
                        {new Date(tx.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <AccountChip accountId={tx.account_id} size="sm" />
                    </div>
                  </div>

                  <div className="text-sm font-bold font-mono text-slate-100">
                    {tx.amount.toFixed(2)} {tx.currency}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
