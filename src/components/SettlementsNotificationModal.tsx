'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { X, CheckCircle, XCircle, Bell } from 'lucide-react';

interface SettlementsNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettlementsNotificationModal: React.FC<SettlementsNotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settlementRequests, respondToSettlement, accounts, defaultCurrency } = useApp();
  const [selectedTargetAccounts, setSelectedTargetAccounts] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleTargetAccountChange = (requestId: string, accountId: string) => {
    setSelectedTargetAccounts((prev) => ({ ...prev, [requestId]: accountId }));
  };

  const handleAccept = (requestId: string) => {
    const defaultAccountId = accounts[0]?.id;
    const targetAccountId = selectedTargetAccounts[requestId] || defaultAccountId;
    respondToSettlement(requestId, true, targetAccountId);
  };

  const handleReject = (requestId: string) => {
    respondToSettlement(requestId, false);
  };

  const pendingRequests = settlementRequests.filter((r) => r.status === 'pending');
  const pastRequests = settlementRequests.filter((r) => r.status !== 'pending');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Settlement Requests</h2>
              <p className="text-xs text-slate-400">Manage repayments from your friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* Pending Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Pending Approvals ({pendingRequests.length})
            </h3>

            {pendingRequests.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm bg-slate-800/30 rounded-xl border border-slate-800">
                No pending settlement requests. You are all caught up!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => {
                  const selectedAccount =
                    accounts.find((a) => a.id === selectedTargetAccounts[req.id]) || accounts[0];

                  return (
                    <div
                      key={req.id}
                      className="p-4 bg-slate-800/80 border border-emerald-500/30 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-100">
                            <strong className="text-emerald-400">{req.from_member_name}</strong> claims they paid you back
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {new Date(req.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        <div className="text-lg font-extrabold font-mono text-emerald-400">
                          +{req.amount.toFixed(2)} {req.currency || defaultCurrency}
                        </div>
                      </div>

                      {/* Deposit account selection */}
                      <div className="pt-2 border-t border-slate-700/60">
                        <label className="text-xs font-medium text-slate-300 block mb-1.5">
                          Select account to deposit money into:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {accounts.map((acc) => {
                            const isSelected = selectedAccount?.id === acc.id;
                            return (
                              <button
                                key={acc.id}
                                type="button"
                                onClick={() => handleTargetAccountChange(req.id, acc.id)}
                                className={`px-2.5 py-1 text-xs rounded-lg border transition-all flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-semibold'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                                }`}
                              >
                                {acc.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                        <button
                          onClick={() => handleAccept(req.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-md transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accept & Deposit to {selectedAccount?.name}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Settlements */}
          {pastRequests.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                History
              </h3>
              <div className="space-y-2">
                {pastRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-slate-300 font-medium">{req.from_member_name}</span> paid{' '}
                      <span className="font-mono text-emerald-400">{req.amount.toFixed(2)} {req.currency}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'accepted'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
