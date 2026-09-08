'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { DcaPlan } from '@/lib/types'

export default function DcaTable({ plans }: { plans: DcaPlan[] }) {
  const router = useRouter()
  const supabase = createClient()

  async function toggleExecuted(plan: DcaPlan) {
    await supabase.from('dca_plans').update({ executed: !plan.executed }).eq('id', plan.id)
    router.refresh()
  }

  const grouped = plans.reduce<Record<string, DcaPlan[]>>((acc, p) => {
    acc[p.ticker] = acc[p.ticker] ? [...acc[p.ticker], p] : [p]
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([ticker, rows]) => (
        <div key={ticker} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="bg-slate-100 px-3 py-2 font-medium">
            {ticker} — target ${rows[0].target_position_usd.toLocaleString()}
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-t border-slate-100 text-left text-xs text-slate-500">
                <th className="px-3 py-2">Tranche</th>
                <th className="px-3 py-2">%</th>
                <th className="px-3 py-2">Amount (USD)</th>
                <th className="px-3 py-2">Trigger</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...rows]
                .sort((a, b) => a.tranche_number - b.tranche_number)
                .map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">Tranche {p.tranche_number}</td>
                    <td className="px-3 py-2">{(p.tranche_pct * 100).toFixed(0)}%</td>
                    <td className="px-3 py-2">${(p.target_position_usd * p.tranche_pct).toFixed(2)}</td>
                    <td className="max-w-sm px-3 py-2">{p.trigger_condition}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => toggleExecuted(p)}
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          p.executed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.executed ? 'Executed' : 'Pending'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
      {plans.length === 0 && <p className="text-sm text-slate-400">No DCA plans yet.</p>}
    </div>
  )
}
