'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { X, Send, Check } from 'lucide-react';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  tricountId: string;
}

export const SettleUpModal: React.FC<SettleUpModalProps> = ({
  isOpen,
  onClose,
  tricountId,
}) => {
  const { tricounts, createSettlementRequest, defaultCurrency } = useApp();

  const group = tricounts.find((g) => g.id === tricountId) || tricounts[0];

  const [fromMemberId, setFromMemberId] = useState<string>(
    group?.members.find((m) => m.id !== 'mem-you')?.id || ''
  );
  const [toMemberId, setToMemberId] = useState<string>('mem-you');
  const [amount, setAmount] = useState<string>('20.00');

  if (!isOpen || !group) return null;

  const fromMember = group.members.find((m) => m.id === fromMemberId);
  const toMember = group.members.find((m) => m.id === toMemberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    createSettlementRequest({
      tricount_id: group.id,
      from_member_id: fromMemberId,
      from_member_name: fromMember?.name || 'Friend',
      to_member_id: toMemberId,
      to_member_name: toMember?.name || 'You (Me)',
      amount: parsedAmount,
      currency: group.currency || defaultCurrency,
      date: new Date().toISOString(),
      notes: 'Debt repayment settlement',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Settle Up Debt</h2>
              <p className="text-xs text-slate-400">{group.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Payer (Who pays)</label>
              <select
                value={fromMemberId}
                onChange={(e) => setFromMemberId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                {group.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Receiver (Gets paid)</label>
              <select
                value={toMemberId}
                onChange={(e) => setToMemberId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                {group.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Repayment Amount ({group.currency})
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xl font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
            Sending this settlement request will notify the recipient to approve the payment and select which wallet to deposit the funds into.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              Send Repayment Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
