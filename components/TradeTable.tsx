import type { Trade } from '@/lib/types'

export default function TradeTable({ trades }: { trades: Trade[] }) {
  const sorted = [...trades].sort(
    (a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()
  )

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            {['Date', 'Ticker', 'Action', 'Shares', 'Price (USD)', 'Amount (USD)', 'FX', 'Amount (CAD)', 'Tranche', 'Window', 'Rationale'].map(
              (h) => (
                <th key={h} className="px-3 py-2 text-left font-medium text-slate-600">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => {
            const amountUsd = t.shares * t.price_usd
            return (
              <tr key={t.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{t.trade_date}</td>
                <td className="px-3 py-2 font-medium">{t.ticker}</td>
                <td className={`px-3 py-2 ${t.action === 'Buy' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.action}
                </td>
                <td className="px-3 py-2">{t.shares}</td>
                <td className="px-3 py-2">${t.price_usd.toFixed(2)}</td>
                <td className="px-3 py-2">${amountUsd.toFixed(2)}</td>
                <td className="px-3 py-2">{t.fx_rate.toFixed(4)}</td>
                <td className="px-3 py-2">${(amountUsd * t.fx_rate).toFixed(2)}</td>
                <td className="px-3 py-2">{t.tranche_number ?? '—'}</td>
                <td className="px-3 py-2">{t.biweekly_window ?? '—'}</td>
                <td className="max-w-xs truncate px-3 py-2" title={t.rationale ?? ''}>
                  {t.rationale ?? '—'}
                </td>
              </tr>
            )
          })}
          {trades.length === 0 && (
            <tr>
              <td colSpan={11} className="px-3 py-6 text-center text-slate-400">
                No trades logged yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
