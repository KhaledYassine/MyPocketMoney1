'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Icon } from './Icon';
import { CategoryBadge } from './CategoryBadge';
import { X, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Calendar } from 'lucide-react';

export const AccountDetailModal: React.FC = () => {
  const { accounts, selectedAccountId, setSelectedAccountId, transactions } = useApp();

  if (!selectedAccountId) return null;

  const account = accounts.find((a) => a.id === selectedAccountId);
  if (!account) return null;

  const accountTransactions = transactions.filter(
    (tx) => tx.account_id === account.id || tx.to_account_id === account.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header Banner */}
        <div
          className="p-6 relative text-white flex flex-col justify-between"
          style={{
            background: `linear-gradient(135deg, ${account.color}30 0%, ${account.color}10 100%)`,
            borderBottom: `1px solid ${account.color}30`,
          }}
        >
          <button
            onClick={() => setSelectedAccountId(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/60 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div
              className="p-3 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: account.color }}
            >
              <Icon name={account.icon || 'Wallet'} className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-75 text-slate-300">
                {account.type} Wallet
              </span>
              <h2 className="text-2xl font-bold text-white">{account.name}</h2>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-slate-400">Current Balance</div>
            <div className="text-3xl font-extrabold tracking-tight font-mono text-emerald-400">
              {account.balance.toFixed(2)}{' '}
              <span className="text-lg font-normal">{account.currency}</span>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Transaction History ({accountTransactions.length})
            </h3>
          </div>

          {accountTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No transactions recorded for this wallet yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {accountTransactions.map((tx) => {
                const isExpense = tx.type === 'expense';
                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg flex items-center justify-center ${
                          isExpense
                            ? 'bg-rose-500/10 text-rose-400'
                            : isIncome
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}
                      >
                        {isExpense && <ArrowUpRight className="w-4 h-4" />}
                        {isIncome && <ArrowDownLeft className="w-4 h-4" />}
                        {isTransfer && <ArrowRightLeft className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-slate-200">
                          {tx.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">
                            {new Date(tx.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          {tx.category_id && <CategoryBadge categoryId={tx.category_id} size="sm" />}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-sm font-bold font-mono ${
                        isExpense
                          ? 'text-rose-400'
                          : isIncome
                          ? 'text-emerald-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {isExpense ? '-' : isIncome ? '+' : ''}
                      {tx.amount.toFixed(2)} {tx.currency}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setSelectedAccountId(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
