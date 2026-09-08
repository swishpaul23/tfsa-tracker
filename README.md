# TFSA Growth Tracker

A Next.js + Supabase rebuild of the Excel workbook (Watchlist/Screener, DCA Entry Planner,
Trade Log, Portfolio Tracker, Quarterly Rebalance) plus the multi-tenant trade-journal ideas
from `swishpaul23/Multi-Tenant-Quantitative-Trading-Dashboard`, ported from Streamlit/CSV to
a real multi-user web app.

## What's in v1

- Email/password auth (Supabase Auth), each user only ever sees their own data (Postgres Row
  Level Security, not the old per-file CSV approach)
- Watchlist & Screener — score candidates 0–10 before buying
- DCA Entry Planner — auto-splits a position into 3 tranches (40/30/30)
- Trade Log — source of truth for cost basis
- Portfolio Tracker — live positions, weights, unrealized G/L, stop-loss levels, computed
  from the trade log plus a live price/FX lookup
- Quarterly Rebalance log

**Not in v1** (by choice, can be added later): AI analyst, market-regime (VIX/SPY/10Y)
context, "Paper Hands" counterfactual analysis.

## Tech stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (Postgres + Auth + Row Level Security) — no separate backend server
- **Live prices:** Yahoo Finance's public chart endpoint (unofficial, no API key). See the
  comment in `lib/marketData.ts` if you want to swap in a keyed provider later.
- **Hosting:** Vercel (or any Next.js host)

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **SQL Editor** → paste the contents of
   `supabase/schema.sql` → **Run**. This creates all five tables, enables RLS with
   per-user policies, and adds a trigger that creates a `profiles` row on signup.
3. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon / public key**
4. (Optional) Under **Authentication → Providers → Email**, you can turn off "Confirm
   email" while testing locally, so signup doesn't require clicking an email link.

## 2. Configure the app

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` → you'll be redirected to `/login` → create an account →
you're in.

## 4. Deploy

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the same two environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy. Vercel builds and hosts the Next.js app; Supabase remains your database/auth
   backend regardless of where the frontend is hosted.

## Project structure

```
app/
  layout.tsx              root layout
  page.tsx                redirects "/" -> "/portfolio"
  login/page.tsx           sign in / sign up
  (app)/                   route group for authenticated pages (shares NavBar)
    layout.tsx
    portfolio/page.tsx      live portfolio (positions, weights, G/L, stop-loss)
    watchlist/page.tsx      screener
    dca/page.tsx             DCA tranche planner
    trades/page.tsx          trade log
    rebalance/page.tsx       quarterly review log
components/                forms + tables, one pair per feature
lib/
  supabase/client.ts        browser Supabase client
  supabase/server.ts        server Supabase client (Server Components)
  types.ts                  TypeScript types matching the schema
  calculations.ts           position/cash-balance math (pure functions, no I/O)
  marketData.ts             live price + FX lookup (single point to swap providers)
middleware.ts               refreshes the Supabase session cookie on every request,
                             gates all routes except /login
supabase/schema.sql          run this once in the Supabase SQL editor
```

## Notes / known limitations to be aware of

- **Yahoo's chart endpoint is unofficial.** It's free and reliable enough for personal use,
  but it can occasionally rate-limit or change shape. If prices stop loading, that's the
  first place to check — `lib/marketData.ts`.
- **Cost basis uses running-average-cost**, computed from the full trade log on every page
  load (`lib/calculations.ts`). If you ever import trades out of chronological order, make
  sure `trade_date` is accurate — the calculation sorts by that field, not insertion order.
- **The DCA Planner and Trade Log are not yet linked.** Marking a DCA tranche "Executed"
  doesn't automatically create a Trade Log row — you log the actual trade separately once
  it fills. Worth wiring together later if it becomes friction.
- No brokerage integration — this is a planning/logging tool, not an execution tool, same
  as the spreadsheet it replaces. You still place trades manually on Wealthsimple.
