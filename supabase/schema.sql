-- Supabase Database Schema for Unified Money Tracker & Tricount Application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  default_currency TEXT DEFAULT 'DT',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACCOUNTS / WALLETS
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'card', 'bank', 'savings', 'e-wallet', 'other')),
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'DT',
  color TEXT NOT NULL DEFAULT '#10B981',
  icon TEXT NOT NULL DEFAULT 'Wallet',
  is_default BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES & SUBCATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  icon TEXT NOT NULL DEFAULT 'Tag',
  color TEXT NOT NULL DEFAULT '#3B82F6',
  budget_limit NUMERIC(12, 2)
);

CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT
);

-- 4. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'DT',
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  notes TEXT,
  receipt_url TEXT,
  tags TEXT[],
  tricount_id UUID,
  shared_expense_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BUDGETS
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  amount_limit NUMERIC(12, 2) NOT NULL,
  month TEXT NOT NULL, -- Format YYYY-MM
  currency TEXT NOT NULL DEFAULT 'DT'
);

-- 6. TRICOUNT GROUPS & MEMBERS
CREATE TABLE IF NOT EXISTS public.tricount_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'DT',
  category TEXT DEFAULT 'General',
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tricount_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tricount_id UUID REFERENCES public.tricount_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  color TEXT
);

-- 7. SHARED EXPENSES & SPLITS
CREATE TABLE IF NOT EXISTS public.shared_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tricount_id UUID REFERENCES public.tricount_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'DT',
  paid_by_member_id UUID REFERENCES public.tricount_members(id) ON DELETE CASCADE,
  paid_from_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expense_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shared_expense_id UUID REFERENCES public.shared_expenses(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.tricount_members(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  percentage NUMERIC(5, 2)
);

-- 8. SETTLEMENT REQUESTS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.settlement_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tricount_id UUID REFERENCES public.tricount_groups(id) ON DELETE CASCADE,
  from_member_id UUID REFERENCES public.tricount_members(id) ON DELETE CASCADE,
  from_member_name TEXT NOT NULL,
  to_member_id UUID REFERENCES public.tricount_members(id) ON DELETE CASCADE,
  to_member_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'DT',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  target_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PLANNED BUYS / WISHLIST
CREATE TABLE IF NOT EXISTS public.planned_buys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  estimated_cost NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'DT',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  target_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  is_purchased BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Storage Bucket Creation Script for Receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;
