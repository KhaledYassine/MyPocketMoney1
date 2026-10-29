'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { uploadReceiptImage } from '@/lib/supabase';
import { X, Camera, Users, Check, Wallet } from 'lucide-react';

interface AddSharedExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTricountId?: string;
}

export const AddSharedExpenseModal: React.FC<AddSharedExpenseModalProps> = ({
  isOpen,
  onClose,
  defaultTricountId,
}) => {
  const {
    tricounts,
    accounts,
    categories,
    addSharedExpense,
    defaultCurrency,
  } = useApp();

  const [tricountId, setTricountId] = useState<string>(
    defaultTricountId || tricounts[0]?.id || ''
  );
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const selectedGroup = tricounts.find((g) => g.id === tricountId) || tricounts[0];

  const [paidByMemberId, setPaidByMemberId] = useState<string>('mem-you');
  const [paidFromAccountId, setPaidFromAccountId] = useState<string>(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [notes, setNotes] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  // Split amounts per member
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  if (!isOpen || !selectedGroup) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadReceiptImage(file);
      setReceiptUrl(url);
    } catch (err) {
      console.error('Receipt upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const memberCount = selectedGroup.members.length;
    const equalShare = parsedAmount / memberCount;

    const splits = selectedGroup.members.map((m) => {
      let memberAmount = equalShare;
      if (splitMode === 'custom' && customSplits[m.id]) {
        const customVal = parseFloat(customSplits[m.id]);
        if (!isNaN(customVal)) memberAmount = customVal;
      }
      return {
        member_id: m.id,
        amount: memberAmount,
      };
    });

    addSharedExpense(
      {
        tricount_id: selectedGroup.id,
        title: title || 'Group Expense',
        amount: parsedAmount,
        currency: selectedGroup.currency || defaultCurrency,
        paid_by_member_id: paidByMemberId,
        date: new Date().toISOString(),
        category_id: categoryId,
        notes,
        receipt_url: receiptUrl || undefined,
        splits,
      },
      paidByMemberId === 'mem-you' ? paidFromAccountId : undefined
    );

    // Reset & Close
    setTitle('');
    setAmount('');
    setNotes('');
    setReceiptUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add Shared Group Expense</h2>
              <p className="text-xs text-slate-400">Record in {selectedGroup.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Select Tricount Group */}
          {tricounts.length > 1 && (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Tricount Group
              </label>
              <select
                value={tricountId}
                onChange={(e) => setTricountId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                {tricounts.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({g.members.length} members)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Expense Title</label>
            <input
              type="text"
              placeholder="e.g. Dinner, Supermarket, Airbnb rent, Fuel..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Total Amount ({selectedGroup.currency})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xl font-black font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

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
          </div>

          {/* Who Paid? */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Paid By</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectedGroup.members.map((m) => {
                const isSelected = paidByMemberId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaidByMemberId(m.id)}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{m.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallet Connection if paid by "You (Me)" */}
          {paidByMemberId === 'mem-you' && (
            <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30 space-y-2">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                Deduct from my Personal Wallet:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {accounts.map((acc) => {
                  const isSelected = paidFromAccountId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setPaidFromAccountId(acc.id)}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>{acc.name}</div>
                      <div className="text-[10px] font-mono opacity-80">
                        {acc.balance.toFixed(2)} {acc.currency}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Full amount will deduct from your chosen wallet, and friends&apos; shares will be tracked as money owed to you!
              </p>
            </div>
          )}

          {/* Split Mode */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400">Expense Split</label>
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSplitMode('equal')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                    splitMode === 'equal' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Equally
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('custom')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                    splitMode === 'custom' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {splitMode === 'equal' ? (
              <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                Split equally among all {selectedGroup.members.length} members (
                {((parseFloat(amount) || 0) / selectedGroup.members.length).toFixed(2)}{' '}
                {selectedGroup.currency} each).
              </div>
            ) : (
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {selectedGroup.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-300 font-medium">{m.name}</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={customSplits[m.id] || ''}
                      onChange={(e) =>
                        setCustomSplits({ ...customSplits, [m.id]: e.target.value })
                      }
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right font-mono text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Receipt / Photo Proof
            </label>
            <label className="w-full bg-slate-950 border border-slate-800 border-dashed rounded-xl px-3 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer flex items-center justify-center gap-1.5 transition-all">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>{uploading ? 'Uploading...' : receiptUrl ? 'Receipt Uploaded ✓' : 'Attach Receipt Photo'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Save Shared Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
