-- ============================================================
-- TFSA Growth Tracker — Supabase schema
-- Run this in the Supabase SQL Editor on a fresh project.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Profiles (one row per user; created automatically on signup)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  initial_capital_cad numeric not null default 7000,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Watchlist & Screener
-- ------------------------------------------------------------
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  company text,
  sector text,
  rev_growth_pct numeric,
  rev_accelerating boolean,
  gross_margin_trend text,
  peg_ratio numeric,
  debt_ok boolean,
  fundamental_score int check (fundamental_score between 0 and 5),
  price_vs_ma text,
  rsi numeric,
  inst_ownership_trend text,
  technical_score int check (technical_score between 0 and 5),
  notes text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- DCA Entry Planner (tranches)
-- ------------------------------------------------------------
create table if not exists public.dca_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  target_position_usd numeric not null,
  tranche_number int not null check (tranche_number in (1, 2, 3)),
  tranche_pct numeric not null,
  planned_date date,
  trigger_condition text,
  executed boolean not null default false,
  actual_price numeric,
  shares numeric,
  notes text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Trade Log (source of truth for cost basis)
-- ------------------------------------------------------------
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_date date not null,
  ticker text not null,
  action text not null check (action in ('Buy', 'Sell')),
  shares numeric not null check (shares > 0),
  price_usd numeric not null check (price_usd >= 0),
  fx_rate numeric not null default 1.38,
  tranche_number int,
  biweekly_window int,
  rationale text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Quarterly Rebalance Log
-- ------------------------------------------------------------
create table if not exists public.quarterly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quarter text not null,
  portfolio_value_start_cad numeric,
  portfolio_value_end_cad numeric,
  positions_trimmed text,
  positions_cut text,
  new_candidates text,
  cash_pct numeric,
  notes text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Row Level Security — every table is scoped to auth.uid()
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.watchlist enable row level security;
alter table public.dca_plans enable row level security;
alter table public.trades enable row level security;
alter table public.quarterly_reviews enable row level security;

create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "watchlist_owner" on public.watchlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "dca_owner" on public.dca_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "trades_owner" on public.trades
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reviews_owner" on public.quarterly_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Auto-create a profile row whenever a new user signs up
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
