'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Account,
  Category,
  Transaction,
  Budget,
  TricountGroup,
  SharedExpense,
  SettlementRequest,
  PlannedBuy,
  Currency,
} from './types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_TRICOUNTS,
  INITIAL_SHARED_EXPENSES,
  INITIAL_SETTLEMENTS,
  INITIAL_PLANNED_BUYS,
} from './mockData';

interface AppContextType {
  // Data
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  tricounts: TricountGroup[];
  sharedExpenses: SharedExpense[];
  settlementRequests: SettlementRequest[];
  plannedBuys: PlannedBuy[];
  defaultCurrency: Currency;

  // Selected Entities for Global Modal/Drawer Inspection (Connected UI)
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  selectedTricountId: string | null;
  setSelectedTricountId: (id: string | null) => void;

  // Actions - Personal Finance
  addAccount: (account: Omit<Account, 'id' | 'created_at'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => void;
  deleteTransaction: (id: string) => void;

  addBudget: (budget: Omit<Budget, 'id'>) => void;

  // Actions - Tricount / Group Expenses
  addTricountGroup: (group: Omit<TricountGroup, 'id' | 'created_at'>) => void;
  addSharedExpense: (
    expense: Omit<SharedExpense, 'id' | 'created_at'>,
    paidFromAccountId?: string
  ) => void;

  // Actions - Settlement Workflow
  createSettlementRequest: (req: Omit<SettlementRequest, 'id' | 'created_at' | 'status'>) => void;
  respondToSettlement: (
    requestId: string,
    accepted: boolean,
    targetAccountId?: string
  ) => void;

  // Actions - Planned Buys / Todo List
  addPlannedBuy: (item: Omit<PlannedBuy, 'id' | 'created_at' | 'is_purchased'>) => void;
  convertPlannedBuyToTransaction: (id: string, accountId: string) => void;
  deletePlannedBuy: (id: string) => void;

  // Calculation Helpers
  calculateMemberBalance: (tricountId: string, memberId: string) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'my_money_tricount_pro_max_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [tricounts, setTricounts] = useState<TricountGroup[]>(INITIAL_TRICOUNTS);
  const [sharedExpenses, setSharedExpenses] = useState<SharedExpense[]>(INITIAL_SHARED_EXPENSES);
  const [settlementRequests, setSettlementRequests] = useState<SettlementRequest[]>(INITIAL_SETTLEMENTS);
  const [plannedBuys, setPlannedBuys] = useState<PlannedBuy[]>(INITIAL_PLANNED_BUYS);
  const [defaultCurrency] = useState<Currency>('DT');

  // Inspection states for interactive connected entity modals
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTricountId, setSelectedTricountId] = useState<string | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.accounts) setAccounts(parsed.accounts);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.budgets) setBudgets(parsed.budgets);
        if (parsed.tricounts) setTricounts(parsed.tricounts);
        if (parsed.sharedExpenses) setSharedExpenses(parsed.sharedExpenses);
        if (parsed.settlementRequests) setSettlementRequests(parsed.settlementRequests);
        if (parsed.plannedBuys) setPlannedBuys(parsed.plannedBuys);
      }
    } catch (e) {
      console.warn('Could not load stored data:', e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      const dataToSave = {
        accounts,
        categories,
        transactions,
        budgets,
        tricounts,
        sharedExpenses,
        settlementRequests,
        plannedBuys,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Could not save data to local storage:', e);
    }
  }, [accounts, categories, transactions, budgets, tricounts, sharedExpenses, settlementRequests, plannedBuys]);

  // Account Management
  const addAccount = (accountData: Omit<Account, 'id' | 'created_at'>) => {
    const newAccount: Account = {
      ...accountData,
      id: `acc-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, newAccount]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc))
    );
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  // Category Management
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // Personal Transaction Recording + Live Wallet Balance Calculation
  const addTransaction = (txData: Omit<Transaction, 'id' | 'created_at'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === newTx.account_id) {
          if (newTx.type === 'expense') {
            return { ...acc, balance: acc.balance - newTx.amount };
          } else if (newTx.type === 'income') {
            return { ...acc, balance: acc.balance + newTx.amount };
          } else if (newTx.type === 'transfer') {
            return { ...acc, balance: acc.balance - newTx.amount };
          }
        }
        if (newTx.type === 'transfer' && acc.id === newTx.to_account_id) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
        return acc;
      })
    );
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Revert account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.account_id) {
          if (tx.type === 'expense') {
            return { ...acc, balance: acc.balance + tx.amount };
          } else if (tx.type === 'income') {
            return { ...acc, balance: acc.balance - tx.amount };
          } else if (tx.type === 'transfer') {
            return { ...acc, balance: acc.balance + tx.amount };
          }
        }
        if (tx.type === 'transfer' && acc.id === tx.to_account_id) {
          return { ...acc, balance: acc.balance - tx.amount };
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addBudget = (budgetData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: `b-${Date.now()}`,
    };
    setBudgets((prev) => [...prev.filter((b) => b.category_id !== newBudget.category_id), newBudget]);
  };

  // Tricount Group & Shared Expense Actions
  const addTricountGroup = (groupData: Omit<TricountGroup, 'id' | 'created_at'>) => {
    const newGroup: TricountGroup = {
      ...groupData,
      id: `tri-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setTricounts((prev) => [...prev, newGroup]);
  };

  const addSharedExpense = (
    expenseData: Omit<SharedExpense, 'id' | 'created_at'>,
    paidFromAccountId?: string
  ) => {
    const newSharedExpense: SharedExpense = {
      ...expenseData,
      id: `se-${Date.now()}`,
      created_at: new Date().toISOString(),
      paid_from_account_id: paidFromAccountId,
    };

    setSharedExpenses((prev) => [newSharedExpense, ...prev]);

    // IF paid by current user ('mem-you') AND a personal account was selected:
    // Deduct total amount from that wallet and record personal transaction linked to tricount
    if (
      expenseData.paid_by_member_id === 'mem-you' &&
      paidFromAccountId
    ) {
      addTransaction({
        type: 'expense',
        amount: expenseData.amount,
        currency: expenseData.currency,
        account_id: paidFromAccountId,
        category_id: expenseData.category_id,
        date: expenseData.date,
        title: `[Tricount] ${expenseData.title}`,
        notes: `Paid for shared group expense: ${expenseData.title}`,
        tricount_id: expenseData.tricount_id,
        shared_expense_id: newSharedExpense.id,
        receipt_url: expenseData.receipt_url,
      });
    }
  };

  // Settlement Request & Approval Workflow
  const createSettlementRequest = (req: Omit<SettlementRequest, 'id' | 'created_at' | 'status'>) => {
    const newReq: SettlementRequest = {
      ...req,
      id: `set-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setSettlementRequests((prev) => [newReq, ...prev]);
  };

  const respondToSettlement = (
    requestId: string,
    accepted: boolean,
    targetAccountId?: string
  ) => {
    const req = settlementRequests.find((r) => r.id === requestId);
    if (!req) return;

    setSettlementRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: accepted ? 'accepted' : 'rejected', target_account_id: targetAccountId }
          : r
      )
    );

    if (accepted) {
      // Find receiving wallet (default to first account if omitted)
      const accId = targetAccountId || accounts[0]?.id;
      if (accId) {
        // Record income transaction to receiving account
        addTransaction({
          type: 'income',
          amount: req.amount,
          currency: req.currency,
          account_id: accId,
          date: new Date().toISOString(),
          title: `Settlement from ${req.from_member_name}`,
          notes: `Paid back for Tricount shared expense`,
          tricount_id: req.tricount_id,
        });
      }

      // Record a settlement entry as a shared expense payment reduction in Tricount
      const group = tricounts.find((g) => g.id === req.tricount_id);
      if (group) {
        const settlementExpense: SharedExpense = {
          id: `se-settle-${Date.now()}`,
          tricount_id: req.tricount_id,
          title: `Settlement: ${req.from_member_name} ➔ ${req.to_member_name}`,
          amount: req.amount,
          currency: req.currency,
          paid_by_member_id: req.from_member_id,
          date: new Date().toISOString(),
          notes: 'Debt settlement payback',
          splits: [{ member_id: req.to_member_id, amount: req.amount }],
          created_at: new Date().toISOString(),
        };
        setSharedExpenses((prev) => [settlementExpense, ...prev]);
      }
    }
  };

  // Planned Buys (Todo list) Actions
  const addPlannedBuy = (itemData: Omit<PlannedBuy, 'id' | 'created_at' | 'is_purchased'>) => {
    const newItem: PlannedBuy = {
      ...itemData,
      id: `plan-${Date.now()}`,
      is_purchased: false,
      created_at: new Date().toISOString(),
    };
    setPlannedBuys((prev) => [newItem, ...prev]);
  };

  const convertPlannedBuyToTransaction = (id: string, accountId: string) => {
    const item = plannedBuys.find((p) => p.id === id);
    if (!item) return;

    // Create real transaction
    addTransaction({
      type: 'expense',
      amount: item.estimated_cost,
      currency: item.currency,
      account_id: accountId,
      category_id: item.category_id,
      date: new Date().toISOString(),
      title: item.title,
      notes: `Purchased from Planned Buys list. ${item.notes || ''}`,
    });

    // Mark planned item as purchased
    setPlannedBuys((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_purchased: true } : p))
    );
  };

  const deletePlannedBuy = (id: string) => {
    setPlannedBuys((prev) => prev.filter((p) => p.id !== id));
  };

  // Member Balance Calculation for Tricounts ("who owes who")
  const calculateMemberBalance = (tricountId: string, memberId: string): number => {
    const expenses = sharedExpenses.filter((e) => e.tricount_id === tricountId);
    let totalPaid = 0;
    let totalOwed = 0;

    expenses.forEach((exp) => {
      if (exp.paid_by_member_id === memberId) {
        totalPaid += exp.amount;
      }
      const mySplit = exp.splits.find((s) => s.member_id === memberId);
      if (mySplit) {
        totalOwed += mySplit.amount;
      }
    });

    return totalPaid - totalOwed; // positive = others owe me; negative = I owe others
  };

  return (
    <AppContext.Provider
      value={{
        accounts,
        categories,
        transactions,
        budgets,
        tricounts,
        sharedExpenses,
        settlementRequests,
        plannedBuys,
        defaultCurrency,
        selectedAccountId,
        setSelectedAccountId,
        selectedCategoryId,
        setSelectedCategoryId,
        selectedTricountId,
        setSelectedTricountId,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        updateCategory,
        deleteCategory,
        addTransaction,
        deleteTransaction,
        addBudget,
        addTricountGroup,
        addSharedExpense,
        createSettlementRequest,
        respondToSettlement,
        addPlannedBuy,
        convertPlannedBuyToTransaction,
        deletePlannedBuy,
        calculateMemberBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
