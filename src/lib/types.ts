export type Currency = 'DT' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'TND';

export type AccountType = 'cash' | 'card' | 'bank' | 'savings' | 'e-wallet' | 'other';

export interface Account {
  id: string;
  user_id?: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  color: string;
  icon: string; // lucide icon name or emoji
  is_default?: boolean;
  notes?: string;
  created_at: string;
}

export type CategoryType = 'expense' | 'income';

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  icon?: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  budget_limit?: number;
  subcategories?: SubCategory[];
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  user_id?: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  account_id: string; // source account
  to_account_id?: string; // target account for transfers
  category_id?: string;
  subcategory_id?: string;
  date: string; // ISO string or YYYY-MM-DD
  title: string;
  notes?: string;
  receipt_url?: string; // photo/receipt image
  tags?: string[];
  tricount_id?: string; // linked tricount group if tied to shared expense
  shared_expense_id?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id?: string;
  category_id: string;
  amount_limit: number;
  month: string; // e.g., '2026-10'
  currency: Currency;
}

export interface TricountMember {
  id: string;
  name: string;
  user_id?: string; // if linked to an actual user account
  avatar_url?: string;
  email?: string;
  color?: string;
}

export interface TricountGroup {
  id: string;
  title: string;
  description?: string;
  currency: Currency;
  category: string;
  created_at: string;
  created_by: string;
  members: TricountMember[];
  image_url?: string;
}

export interface ExpenseSplit {
  member_id: string;
  amount: number; // calculated share
  percentage?: number;
}

export interface SharedExpense {
  id: string;
  tricount_id: string;
  title: string;
  amount: number;
  currency: Currency;
  paid_by_member_id: string;
  paid_from_account_id?: string; // if paid by current user from a personal wallet
  date: string;
  category_id?: string;
  notes?: string;
  receipt_url?: string;
  splits: ExpenseSplit[]; // array of member split details
  created_at: string;
}

export type SettlementStatus = 'pending' | 'accepted' | 'rejected';

export interface SettlementRequest {
  id: string;
  tricount_id: string;
  from_member_id: string;
  from_member_name: string;
  to_member_id: string;
  to_member_name: string;
  amount: number;
  currency: Currency;
  status: SettlementStatus;
  date: string;
  target_account_id?: string; // target account where money is deposited upon acceptance
  notes?: string;
  created_at: string;
}

export interface PlannedBuy {
  id: string;
  user_id?: string;
  title: string;
  estimated_cost: number;
  currency: Currency;
  category_id?: string;
  target_account_id?: string;
  priority: 'low' | 'medium' | 'high';
  is_purchased: boolean;
  notes?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  default_currency: Currency;
  theme: 'light' | 'dark' | 'system';
}
