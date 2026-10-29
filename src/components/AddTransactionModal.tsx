'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { TransactionType } from '@/lib/types';
import { uploadReceiptImage } from '@/lib/supabase';
import { Icon } from './Icon';
import { X, Camera, Check } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { accounts, categories, addTransaction, defaultCurrency } = useApp();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || '');
  const [categoryId, setCategoryId] = useState<string>(
    categories.find((c) => c.type === 'expense')?.id || ''
  );
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));
  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadReceiptImage(file);
      setReceiptUrl(url);
    } catch (err) {
      console.error('Error uploading receipt:', err);
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

    const subcategoryObj = selectedCategory?.subcategories?.find((s) => s.id === subcategoryId);

    addTransaction({
      type,
      amount: parsedAmount,
      currency: defaultCurrency,
      account_id: accountId,
      to_account_id: type === 'transfer' ? toAccountId : undefined,
      category_id: type !== 'transfer' ? categoryId : undefined,
      subcategory_id: subcategoryId || undefined,
      date: new Date(date).toISOString(),
      title: title || (type === 'transfer' ? 'Account Transfer' : selectedCategory?.name || 'Transaction'),
      notes: subcategoryObj ? `[${subcategoryObj.name}] ${notes}` : notes,
      receipt_url: receiptUrl || undefined,
    });

    // Reset & Close
    setAmount('');
    setTitle('');
    setNotes('');
    setReceiptUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Tabs */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex bg-slate-800/80 p-1 rounded-xl w-full max-w-xs">
            {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  const cat = categories.find((c) => c.type === (t === 'income' ? 'income' : 'expense'));
                  if (cat) setCategoryId(cat.id);
                }}
                className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                  type === t
                    ? t === 'expense'
                      ? 'bg-rose-500 text-white shadow'
                      : t === 'income'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'bg-blue-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Amount Field */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Amount ({defaultCurrency})
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-3xl font-extrabold font-mono text-white placeholder-slate-700 focus:outline-none transition-all"
              />
              <span className="absolute right-4 font-bold text-slate-500 text-lg">
                {defaultCurrency}
              </span>
            </div>
          </div>

          {/* Account Selection */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">From Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-medium text-white focus:outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.balance.toFixed(2)} {acc.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">To Account</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-medium text-white focus:outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.balance.toFixed(2)} {acc.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Wallet / Account</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {accounts.map((acc) => {
                  const isSelected = accountId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setAccountId(acc.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 shadow'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <Icon name={acc.icon || 'Wallet'} className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="truncate">{acc.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 mt-1">
                        {acc.balance.toFixed(2)} {acc.currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category & Subcategory Selection (Non-transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                {filteredCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(cat.id);
                        setSubcategoryId('');
                      }}
                      className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 font-bold'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                      style={{ color: isSelected ? cat.color : '#CBD5E1' }}
                    >
                      <Icon name={cat.icon || 'Tag'} className="w-4 h-4" />
                      <span className="text-xs truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Subcategory options if present */}
              {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
                <div className="mt-2.5">
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Subcategory (Optional)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategory.subcategories.map((sub) => {
                      const isSubSelected = subcategoryId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSubcategoryId(isSubSelected ? '' : sub.id)}
                          className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                            isSubSelected
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-semibold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Title / Note */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Title & Note</label>
            <input
              type="text"
              placeholder="e.g., Khobz, Coffee, Grocery shopping..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 mb-2"
            />
            <input
              type="text"
              placeholder="Additional notes or tags..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Date & Receipt Attachment */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Receipt Image</label>
              <label className="w-full bg-slate-950 border border-slate-800 border-dashed rounded-xl px-3 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer flex items-center justify-center gap-1.5 transition-all">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{uploading ? 'Uploading...' : receiptUrl ? 'Receipt Added ✓' : 'Attach Receipt'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {receiptUrl && (
            <div className="relative rounded-xl overflow-hidden border border-slate-700 h-24 bg-slate-950 flex items-center justify-center">
              <img src={receiptUrl} alt="Receipt Preview" className="max-h-full object-contain" />
              <button
                type="button"
                onClick={() => setReceiptUrl('')}
                className="absolute top-2 right-2 bg-slate-900/80 p-1 rounded-full text-rose-400 hover:text-rose-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-5 h-5" />
              Record {type.toUpperCase()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
