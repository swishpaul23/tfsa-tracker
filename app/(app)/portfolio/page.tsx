import { createClient } from '@/lib/supabase/server'
import { computePositions, cashRemainingCad } from '@/lib/calculations'
import { getPrice } from '@/lib/marketData'
import RefreshButton from '@/components/RefreshButton'
import type { Trade } from '@/lib/types'

export const dynamic = 'force-dynamic'

const FX_FALLBACK = 1.38 // used only if the live USD/CAD fetch fails

export default async function PortfolioPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('initial_capital_cad')
    .eq('id', user!.id)
    .single()

  const { data: tradesData } = await supabase
    .from('trades')
    .select('*')
    .order('trade_date', { ascending: true })

  const trades = (tradesData ?? []) as Trade[]
  const positions = computePositions(trades)
  const initialCapital = profile?.initial_capital_cad ?? 7000
  const cashCad = cashRemainingCad(trades, initialCapital)

  const liveFx = (await getPrice('CAD=X')) ?? FX_FALLBACK

  const priced = await Promise.all(
    positions.map(async (p) => {
      const currentPriceUsd = await getPrice(p.ticker)
      const marketValueUsd = currentPriceUsd !== null ? currentPriceUsd * p.shares : null
      const unrealizedUsd = marketValueUsd !== null ? marketValueUsd - p.costBasisUsd : null
      const unrealizedPct =
        marketValueUsd !== null && p.costBasisUsd > 0 ? unrealizedUsd! / p.costBasisUsd : null
      const marketValueCad = marketValueUsd !== null ? marketValueUsd * liveFx : null
      return {
        ...p,
        currentPriceUsd,
        marketValueUsd,
        unrealizedUsd,
        unrealizedPct,
        marketValueCad,
        stopLoss: p.avgCostUsd * 0.85,
      }
    })
  )

  const totalMarketValueCad = priced.reduce((sum, r) => sum + (r.marketValueCad ?? 0), 0)
  const totalPortfolioCad = totalMarketValueCad + cashCad
  const returnSinceInception = (totalPortfolioCad - initialCapital) / initialCapital

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Portfolio</h1>
          <p className="text-sm text-slate-500">Live prices via Yahoo Finance · FX: {liveFx.toFixed(4)} USD/CAD</p>
        </div>
        <RefreshButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <SummaryCard label="Total Portfolio Value" value={`$${totalPortfolioCad.toFixed(2)} CAD`} />
        <SummaryCard label="Cash Remaining" value={`$${cashCad.toFixed(2)} CAD`} />
        <SummaryCard label="Holdings Value" value={`$${totalMarketValueCad.toFixed(2)} CAD`} />
        <SummaryCard
          label="Return Since Inception"
          value={`${(returnSinceInception * 100).toFixed(1)}%`}
          positive={returnSinceInception >= 0}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              {[
                'Ticker',
                'Shares',
                'Avg Cost (USD)',
                'Cost Basis (USD)',
                'Current Price (USD)',
                'Market Value (USD)',
                'Unrealized G/L',
                'Weight',
                'Stop-Loss (-15%)',
              ].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-medium text-slate-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {priced.map((r) => (
              <tr key={r.ticker} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{r.ticker}</td>
                <td className="px-3 py-2">{r.shares.toFixed(4)}</td>
                <td className="px-3 py-2">${r.avgCostUsd.toFixed(2)}</td>
                <td className="px-3 py-2">${r.costBasisUsd.toFixed(2)}</td>
                <td className="px-3 py-2">{r.currentPriceUsd !== null ? `$${r.currentPriceUsd.toFixed(2)}` : '—'}</td>
                <td className="px-3 py-2">{r.marketValueUsd !== null ? `$${r.marketValueUsd.toFixed(2)}` : '—'}</td>
                <td
                  className={`px-3 py-2 ${
                    r.unrealizedPct !== null && r.unrealizedPct < 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {r.unrealizedPct !== null ? `${(r.unrealizedPct * 100).toFixed(1)}%` : '—'}
                </td>
                <td className="px-3 py-2">
                  {totalMarketValueCad > 0 && r.marketValueCad
                    ? `${((r.marketValueCad / totalMarketValueCad) * 100).toFixed(1)}%`
                    : '—'}
                </td>
                <td className="px-3 py-2">${r.stopLoss.toFixed(2)}</td>
              </tr>
            ))}
            {priced.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-slate-400">
                  No open positions yet — log a trade to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div
        className={`mt-1 text-xl font-semibold ${
          positive === undefined ? '' : positive ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {value}
      </div>
    </div>
  )
}
