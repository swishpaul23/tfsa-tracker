import type { Trade } from './types'

export interface Position {
  ticker: string
  shares: number
  avgCostUsd: number
  costBasisUsd: number
}

/**
 * Rebuilds current open positions (shares held + average cost) from the
 * full trade log, using a running-average-cost method. Processes trades
 * in chronological order so partial sells reduce cost basis correctly.
 */
export function computePositions(trades: Trade[]): Position[] {
  const map = new Map<string, { shares: number; costUsd: number }>()

  const sorted = [...trades].sort(
    (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  )

  for (const t of sorted) {
    const existing = map.get(t.ticker) ?? { shares: 0, costUsd: 0 }
    if (t.action === 'Buy') {
      existing.shares += t.shares
      existing.costUsd += t.shares * t.price_usd
    } else {
      const avgCost = existing.shares > 0 ? existing.costUsd / existing.shares : 0
      existing.shares -= t.shares
      existing.costUsd -= avgCost * t.shares
    }
    map.set(t.ticker, existing)
  }

  const positions: Position[] = []
  for (const [ticker, v] of map.entries()) {
    if (v.shares > 0.0001) {
      positions.push({
        ticker,
        shares: v.shares,
        avgCostUsd: v.costUsd / v.shares,
        costBasisUsd: v.costUsd,
      })
    }
  }
  return positions
}

/**
 * Cash remaining in CAD: initial capital minus every buy (converted at that
 * trade's own fx_rate) plus every sell (also at its own fx_rate). This is
 * why every trade stores its own fx_rate rather than using a single global
 * rate — historical conversions shouldn't move when today's rate changes.
 */
export function cashRemainingCad(trades: Trade[], initialCapitalCad: number): number {
  let cash = initialCapitalCad
  for (const t of trades) {
    const cadAmount = t.shares * t.price_usd * t.fx_rate
    cash += t.action === 'Buy' ? -cadAmount : cadAmount
  }
  return cash
}

export function scoreVerdict(total: number): string {
  if (total >= 8) return 'Strong candidate'
  if (total >= 6) return 'Watch'
  return ''
}
