'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { AccountChip } from './AccountChip';
import { CategoryBadge } from './CategoryBadge';
import { Icon } from './Icon';
import { AddTransactionModal } from './AddTransactionModal';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Image as ImageIcon,
  Trash2,
  Wallet,
} from 'lucide-react';

export const RecordsView: React.FC = () => {
  const {
    transactions,
    accounts,
    categories,
    deleteTransaction,
    defaultCurrency,
    setSelectedAccountId,
  } = useApp();

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [activeMonth] = useState('October 2026');

  // Calculate monthly expense and income totals
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group transactions by date
  const groupedTransactions = transactions.reduce<Record<string, typeof transactions>>(
    (groups, tx) => {
      const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        weekday: 'long',
      });
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(tx);
      return groups;
    },
    {}
  );

  return (
    <div className="pb-24 max-w-4xl mx-auto px-4 pt-3 space-y-5">
      {/* 1. Monthly Summary Header (My Money Tracker Style) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Month Selector */}
        <div className="flex items-center justify-between text-slate-200">
          <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight">{activeMonth}</h2>
          <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Expense vs Income Banner */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              EXPENSE
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-400 mt-0.5">
              {totalExpense.toFixed(2)}
              <span className="text-xs font-semibold ml-1">{defaultCurrency}</span>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              INCOME
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-0.5">
              {totalIncome.toFixed(2)}
              <span className="text-xs font-semibold ml-1">{defaultCurrency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Wallets Quick Bar */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-400" />
            My Wallets & Accounts
          </h3>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className="flex-shrink-0 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 p-3 rounded-xl transition-all text-left flex items-center gap-3 min-w-[150px] shadow-sm"
            >
              <div
                className="p-2 rounded-lg text-white"
                style={{ backgroundColor: acc.color }}
              >
                <Icon name={acc.icon || 'Wallet'} className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">{acc.name}</div>
                <div className="text-xs font-mono font-semibold text-emerald-400">
                  {acc.balance.toFixed(2)} {acc.currency}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Daily Grouped Records Feed */}
      <div className="space-y-4">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
            No records for this period. Tap the (+) button below to record your expenses!
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([dateLabel, txList]) => (
            <div key={dateLabel} className="space-y-2">
              {/* Date Header */}
              <div className="text-xs font-bold text-slate-400 px-1 border-b border-slate-800/60 pb-1">
                {dateLabel}
              </div>

              {/* Transactions in Date */}
              <div className="space-y-2">
                {txList.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  const isIncome = tx.type === 'income';
                  const isTransfer = tx.type === 'transfer';
                  const cat = categories.find((c) => c.id === tx.category_id);

                  return (
                    <div
                      key={tx.id}
                      className="bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between transition-all group shadow-sm"
                    >
                      {/* Left side: Icon + Title + Meta */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            isExpense
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                              : isIncome
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {cat ? (
                            <Icon name={cat.icon || 'Tag'} className="w-5 h-5" />
                          ) : isExpense ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : isIncome ? (
                            <ArrowDownLeft className="w-5 h-5" />
                          ) : (
                            <ArrowRightLeft className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            <span>{tx.title}</span>
                            {tx.receipt_url && (
                              <a
                                href={tx.receipt_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                                title="View Receipt"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <AccountChip accountId={tx.account_id} size="sm" />
                            {isTransfer && tx.to_account_id && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                ➔ <AccountChip accountId={tx.to_account_id} size="sm" />
                              </span>
                            )}
                            {tx.category_id && <CategoryBadge categoryId={tx.category_id} size="sm" />}
                            {tx.notes && (
                              <span className="text-[11px] text-slate-400 italic">
                                &quot;{tx.notes}&quot;
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Amount + Actions */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`text-sm sm:text-base font-extrabold font-mono text-right ${
                            isExpense
                              ? 'text-rose-400'
                              : isIncome
                              ? 'text-emerald-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {isExpense ? '-' : isIncome ? '+' : ''}
                          {tx.amount.toFixed(2)}
                          <span className="text-xs font-normal ml-0.5">{tx.currency}</span>
                        </div>

                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsAddTxOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-6 z-40 bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-4 rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        title="Add New Transaction"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* Modal */}
      <AddTransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
    </div>
  );
};
