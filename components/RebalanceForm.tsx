'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RebalanceForm() {
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

    const startVal = parseFloat(form.get('start_value') as string)
    const endVal = parseFloat(form.get('end_value') as string)
    const cashPct = parseFloat(form.get('cash_pct') as string)

    const { error: insertError } = await supabase.from('quarterly_reviews').insert({
      user_id: user.id,
      quarter: form.get('quarter') as string,
      portfolio_value_start_cad: Number.isFinite(startVal) ? startVal : null,
      portfolio_value_end_cad: Number.isFinite(endVal) ? endVal : null,
      positions_trimmed: (form.get('trimmed') as string) || null,
      positions_cut: (form.get('cut') as string) || null,
      new_candidates: (form.get('new_candidates') as string) || null,
      cash_pct: Number.isFinite(cashPct) ? cashPct / 100 : null,
      notes: (form.get('notes') as string) || null,
    })

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
      className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3"
    >
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Quarter
        <input
          name="quarter"
          placeholder="Q4 2026"
          required
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Portfolio Value Start (CAD)
        <input name="start_value" type="number" step="0.01" className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Portfolio Value End (CAD)
        <input name="end_value" type="number" step="0.01" className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Positions Trimmed
        <input name="trimmed" className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Positions Cut
        <input name="cut" className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        New Candidates Added
        <input name="new_candidates" className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Cash % at Quarter End
        <input name="cash_pct" type="number" step="0.1" className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </label>
      <div className="col-span-2 sm:col-span-3">
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          Notes / Lessons
          <textarea name="notes" rows={2} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
        </label>
      </div>

      {error && <p className="col-span-full text-sm text-red-600">{error}</p>}

      <div className="col-span-full">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Log Quarterly Review'}
        </button>
      </div>
    </form>
  )
}
