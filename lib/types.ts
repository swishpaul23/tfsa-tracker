export interface Trade {
  id: string
  user_id: string
  trade_date: string
  ticker: string
  action: 'Buy' | 'Sell'
  shares: number
  price_usd: number
  fx_rate: number
  tranche_number: number | null
  biweekly_window: number | null
  rationale: string | null
  created_at: string
}

export interface WatchlistItem {
  id: string
  user_id: string
  ticker: string
  company: string | null
  sector: string | null
  rev_growth_pct: number | null
  rev_accelerating: boolean | null
  gross_margin_trend: string | null
  peg_ratio: number | null
  debt_ok: boolean | null
  fundamental_score: number | null
  price_vs_ma: string | null
  rsi: number | null
  inst_ownership_trend: string | null
  technical_score: number | null
  notes: string | null
  created_at: string
}

export interface DcaPlan {
  id: string
  user_id: string
  ticker: string
  target_position_usd: number
  tranche_number: 1 | 2 | 3
  tranche_pct: number
  planned_date: string | null
  trigger_condition: string | null
  executed: boolean
  actual_price: number | null
  shares: number | null
  notes: string | null
  created_at: string
}

export interface QuarterlyReview {
  id: string
  user_id: string
  quarter: string
  portfolio_value_start_cad: number | null
  portfolio_value_end_cad: number | null
  positions_trimmed: string | null
  positions_cut: string | null
  new_candidates: string | null
  cash_pct: number | null
  notes: string | null
  created_at: string
}

export interface Profile {
  id: string
  display_name: string | null
  initial_capital_cad: number
  created_at: string
}
