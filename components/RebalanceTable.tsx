import type { QuarterlyReview } from '@/lib/types'

export default function RebalanceTable({ reviews }: { reviews: QuarterlyReview[] }) {
  return (
    <div className="space-y-4">
      {reviews.map((r) => {
        const ret =
          r.portfolio_value_start_cad && r.portfolio_value_end_cad
            ? (r.portfolio_value_end_cad - r.portfolio_value_start_cad) / r.portfolio_value_start_cad
            : null
        return (
          <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{r.quarter}</h3>
              {ret !== null && (
                <span className={ret >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {(ret * 100).toFixed(1)}% quarter return
                </span>
              )}
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <Field label="Start" value={r.portfolio_value_start_cad ? `$${r.portfolio_value_start_cad.toFixed(2)}` : '—'} />
              <Field label="End" value={r.portfolio_value_end_cad ? `$${r.portfolio_value_end_cad.toFixed(2)}` : '—'} />
              <Field label="Trimmed" value={r.positions_trimmed || '—'} />
              <Field label="Cut" value={r.positions_cut || '—'} />
              <Field label="New Candidates" value={r.new_candidates || '—'} />
              <Field label="Cash %" value={r.cash_pct ? `${(r.cash_pct * 100).toFixed(1)}%` : '—'} />
            </dl>
            {r.notes && <p className="mt-2 text-sm text-slate-600">{r.notes}</p>}
          </div>
        )
      })}
      {reviews.length === 0 && <p className="text-sm text-slate-400">No quarterly reviews logged yet.</p>}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
