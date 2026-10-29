'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { CategoryBadge } from './CategoryBadge';
import { PieChart, ResponsiveContainer, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

export const AnalysisView: React.FC = () => {
  const { transactions, categories, accounts, defaultCurrency } = useApp();

  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);

  const totalNetWorth = accounts.reduce((acc, a) => acc + a.balance, 0);

  // Group expenses by category for pie chart
  const categoryData = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const amount = expenseTransactions
        .filter((t) => t.category_id === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;

      return {
        id: cat.id,
        name: cat.name,
        amount,
        percentage,
        color: cat.color,
      };
    })
    .filter((d) => d.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="pb-24 max-w-4xl mx-auto px-4 pt-3 space-y-6">
      {/* Net Worth & High-Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Total Net Worth
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            {totalNetWorth.toFixed(2)} <span className="text-xs text-slate-300 font-normal">{defaultCurrency}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Income This Month
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            +{totalIncome.toFixed(2)} <span className="text-xs text-slate-300 font-normal">{defaultCurrency}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-400" /> Expense This Month
          </div>
          <div className="text-2xl font-black font-mono text-rose-400 mt-1">
            -{totalExpense.toFixed(2)} <span className="text-xs text-slate-300 font-normal">{defaultCurrency}</span>
          </div>
        </div>
      </div>

      {/* Spending Breakdown Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-400" />
            Category Spending Distribution
          </h2>
          <span className="text-xs text-slate-400 font-semibold font-mono">
            Total: {totalExpense.toFixed(2)} {defaultCurrency}
          </span>
        </div>

        {categoryData.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No expenses recorded to generate analytics.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Pie Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [
                      `${Number(value || 0).toFixed(2)} ${defaultCurrency}`,
                      'Spent',
                    ]}
                    contentStyle={{ backgroundColor: '#090D16', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend & Breakdown Table */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {categoryData.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <CategoryBadge categoryId={item.id} size="sm" />
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-slate-200">
                      {item.amount.toFixed(2)} {defaultCurrency}
                    </div>
                    <div className="text-[10px] text-slate-400">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
