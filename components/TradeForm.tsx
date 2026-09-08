'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function TradeForm() {
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

    const shares = parseFloat(form.get('shares') as string)
    const price = parseFloat(form.get('price_usd') as string)
    const fx = parseFloat(form.get('fx_rate') as string)
    const trancheRaw = form.get('tranche_number') as string
    const windowRaw = form.get('biweekly_window') as string

    const { error: insertError } = await supabase.from('trades').insert({
      user_id: user.id,
      trade_date: form.get('trade_date') as string,
      ticker: (form.get('ticker') as string).toUpperCase(),
      action: form.get('action') as string,
      shares,
      price_usd: price,
      fx_rate: Number.isFinite(fx) ? fx : 1.38,
      tranche_number: trancheRaw ? parseInt(trancheRaw, 10) : null,
      biweekly_window: windowRaw ? parseInt(windowRaw, 10) : null,
      rationale: (form.get('rationale') as string) || null,
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
      className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-4"
    >
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Date
        <input name="trade_date" type="date" required className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Ticker
        <input name="ticker" required className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Action
        <select name="action" className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          <option value="Buy">Buy</option>
          <option value="Sell">Sell</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Shares
        <input
          name="shares"
          type="number"
          step="0.0001"
          min="0"
          required
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Price (USD)
        <input
          name="price_usd"
          type="number"
          step="0.01"
          min="0"
          required
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        FX Rate (USD/CAD)
        <input
          name="fx_rate"
          type="number"
          step="0.0001"
          defaultValue={1.38}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Tranche #
        <input name="tranche_number" type="number" min={1} max={3} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600">
        Biweekly Window #
        <input name="biweekly_window" type="number" min={1} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </label>
      <div className="col-span-2 sm:col-span-4">
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          Rationale
          <input name="rationale" className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
        </label>
      </div>

      {error && <p className="col-span-full text-sm text-red-600">{error}</p>}

      <div className="col-span-full">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Logging…' : 'Log Trade'}
        </button>
      </div>
    </form>
  )
}
