import type { WatchlistItem } from '@/lib/types'
import { scoreVerdict } from '@/lib/calculations'

export default function WatchlistTable({ items }: { items: WatchlistItem[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            {['Ticker', 'Company', 'Sector', 'Rev Growth', 'Accel?', 'PEG', 'Fund. Score', 'Tech Score', 'Total', 'Verdict', 'Notes'].map(
              (h) => (
                <th key={h} className="px-3 py-2 text-left font-medium text-slate-600">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((i) => {
            const total = (i.fundamental_score ?? 0) + (i.technical_score ?? 0)
            const verdict = scoreVerdict(total)
            return (
              <tr key={i.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{i.ticker}</td>
                <td className="px-3 py-2">{i.company ?? '—'}</td>
                <td className="px-3 py-2">{i.sector ?? '—'}</td>
                <td className="px-3 py-2">
                  {i.rev_growth_pct !== null ? `${(i.rev_growth_pct * 100).toFixed(1)}%` : '—'}
                </td>
                <td className="px-3 py-2">{i.rev_accelerating ? 'Y' : 'N'}</td>
                <td className="px-3 py-2">{i.peg_ratio ?? '—'}</td>
                <td className="px-3 py-2">{i.fundamental_score ?? '—'}</td>
                <td className="px-3 py-2">{i.technical_score ?? '—'}</td>
                <td className="px-3 py-2 font-medium">{total}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      total >= 8 ? 'text-green-600' : total >= 6 ? 'text-amber-600' : 'text-slate-400'
                    }
                  >
                    {verdict}
                  </span>
                </td>
                <td className="max-w-xs truncate px-3 py-2" title={i.notes ?? ''}>
                  {i.notes ?? '—'}
                </td>
              </tr>
            )
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={11} className="px-3 py-6 text-center text-slate-400">
                No candidates yet — add one above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
