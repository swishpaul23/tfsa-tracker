'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SPLITS = [0.4, 0.3, 0.3]
const TRIGGERS = [
  'Passes screen — initial entry',
  'Still fundamentally sound on next biweekly window',
  'Still fundamentally sound; better if pulled back on no bad news',
]

export default function DcaForm() {
  const router = useRouter()
  const supabase = createClient()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const form = new FormData(e.currentTarget)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('Not signed in')
      setSubmitting(false)
      return
    }

    const ticker = (form.get('ticker') as string).toUpperCase()
    const target = parseFloat(form.get('target_position_usd') as string)

    if (!ticker || !Number.isFinite(target) || target <= 0) {
      setError('Enter a ticker and a positive target position size.')
      setSubmitting(false)
      return
    }

    const rows = SPLITS.map((pct, idx) => ({
      user_id: user.id,
      ticker,
      target_position_usd: target,
      tranche_number: idx + 1,
      tranche_pct: pct,
      trigger_condition: TRIGGERS[idx],
      executed: false,
    }))

    const { error: insertError } = await supabase.from('dca_plans').insert(rows)

    if (insertError) {
      setError(insertError.message)
    } else {
      e.currentTarget.reset()
      router.refresh()
    }
    setSubmitting(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
    >
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Ticker
        <input name="ticker" required className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Target Position (USD)
        <input
          name="target_position_usd"
          type="number"
          step="1"
          min="1"
          required
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Creating…' : 'Create 3-Tranche Plan (40/30/30)'}
      </button>
    </form>
  )
}
