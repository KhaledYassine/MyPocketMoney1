'use client';

import React from 'react';
import { Account } from '@/lib/types';
import { useApp } from '@/lib/store';
import { Icon } from './Icon';

interface AccountChipProps {
  account?: Account;
  accountId?: string;
  showBalance?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AccountChip: React.FC<AccountChipProps> = ({
  account: accountProp,
  accountId,
  showBalance = false,
  size = 'md',
  className = '',
}) => {
  const { accounts, setSelectedAccountId } = useApp();

  const account = accountProp || accounts.find((a) => a.id === accountId);

  if (!account) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAccountId(account.id);
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center rounded-full border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${account.color}15`,
        borderColor: `${account.color}40`,
        color: account.color,
      }}
      title={`Click to view ${account.name} details & history`}
    >
      <Icon name={account.icon || 'Wallet'} className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="font-semibold">{account.name}</span>
      {showBalance && (
        <span className="opacity-80 font-mono ml-0.5">
          ({account.balance.toFixed(2)} {account.currency})
        </span>
      )}
    </button>
  );
};
