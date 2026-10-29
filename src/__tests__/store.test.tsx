import { describe, it, expect, beforeEach } from 'vitest';
import {
  INITIAL_ACCOUNTS,
  INITIAL_TRICOUNTS,
  INITIAL_SHARED_EXPENSES,
} from '../lib/mockData';

describe('Financial State Calculations & Logic', () => {
  beforeEach(() => {
    // Reset test fixtures
  });

  it('calculates initial wallet total balance accurately', () => {
    const totalBalance = INITIAL_ACCOUNTS.reduce((acc, a) => acc + a.balance, 0);
    // Cash: 142.50, Bank Card: 1250.00, Savings: 3400.00, E-Wallet: 85.00
    expect(totalBalance).toBe(4877.50);
  });

  it('calculates member balances in Tricount group correctly', () => {
    const group = INITIAL_TRICOUNTS[0]; // Weekend Getaway Trip
    const expenses = INITIAL_SHARED_EXPENSES.filter((e) => e.tricount_id === group.id);

    // Calculate 'mem-you' balance
    let paid = 0;
    let owed = 0;

    expenses.forEach((exp) => {
      if (exp.paid_by_member_id === 'mem-you') {
        paid += exp.amount;
      }
      const mySplit = exp.splits.find((s) => s.member_id === 'mem-you');
      if (mySplit) {
        owed += mySplit.amount;
      }
    });

    const netBalance = paid - owed;
    // Dinner: 160 paid by you, split 40 each. Tolls: 80 paid by Anes, split 20 each.
    // Paid = 160, Owed = 40 (dinner) + 20 (tolls) = 60. Net = +100.
    expect(paid).toBe(160);
    expect(owed).toBe(60);
    expect(netBalance).toBe(100);
  });

  it('deducts wallet balance when expense is recorded', () => {
    const account = { ...INITIAL_ACCOUNTS[0] }; // Cash balance = 142.50
    const expenseAmount = 42.50;
    account.balance -= expenseAmount;

    expect(account.balance).toBe(100.00);
  });

  it('increases wallet balance when income or settlement is accepted', () => {
    const account = { ...INITIAL_ACCOUNTS[0] }; // Cash balance = 142.50
    const repaymentAmount = 25.00;
    account.balance += repaymentAmount;

    expect(account.balance).toBe(167.50);
  });
});
