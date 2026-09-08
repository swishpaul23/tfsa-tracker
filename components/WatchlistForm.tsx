'use client'

import { useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function WatchlistForm() {
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

    const revGrowthRaw = parseFloat(form.get('rev_growth_pct') as string)
    const pegRaw = parseFloat(form.get('peg_ratio') as string)
    const rsiRaw = parseFloat(form.get('rsi') as string)
    const fundRaw = parseInt(form.get('fundamental_score') as string, 10)
    const techRaw = parseInt(form.get('technical_score') as string, 10)

    const { error: insertError } = await supabase.from('watchlist').insert({
      user_id: user.id,
      ticker: (form.get('ticker') as string).toUpperCase(),
      company: (form.get('company') as string) || null,
      sector: (form.get('sector') as string) || null,
      rev_growth_pct: Number.isFinite(revGrowthRaw) ? revGrowthRaw / 100 : null,
      rev_accelerating: form.get('rev_accelerating') === 'Y',
      gross_margin_trend: (form.get('gross_margin_trend') as string) || null,
      peg_ratio: Number.isFinite(pegRaw) ? pegRaw : null,
      debt_ok: form.get('debt_ok') === 'Y',
      fundamental_score: Number.isFinite(fundRaw) ? fundRaw : 0,
      price_vs_ma: (form.get('price_vs_ma') as string) || null,
      rsi: Number.isFinite(rsiRaw) ? rsiRaw : null,
      inst_ownership_trend: (form.get('inst_ownership_trend') as string) || null,
      technical_score: Number.isFinite(techRaw) ? techRaw : 0,
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
      className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-4"
    >
      <Input name="ticker" label="Ticker" required />
      <Input name="company" label="Company" />
      <Input name="sector" label="Sector" />
      <Input name="rev_growth_pct" label="Rev Growth YoY %" type="number" step="0.1" />
      <Select name="rev_accelerating" label="Accelerating?" options={['Y', 'N']} />
      <Input name="gross_margin_trend" label="Gross Margin Trend" placeholder="Expanding" />
      <Input name="peg_ratio" label="PEG Ratio" type="number" step="0.1" />
      <Select name="debt_ok" label="Debt/EBITDA OK?" options={['Y', 'N']} />
      <Input name="fundamental_score" label="Fundamental Score (0-5)" type="number" min={0} max={5} />
      <Input name="price_vs_ma" label="Price vs 50/200MA" placeholder="Above both" />
      <Input name="rsi" label="RSI" type="number" step="1" />
      <Input name="inst_ownership_trend" label="Inst. Ownership Trend" placeholder="Rising" />
      <Input name="technical_score" label="Technical Score (0-5)" type="number" min={0} max={5} />
      <div className="col-span-2 sm:col-span-4">
        <Input name="notes" label="Notes / Catalyst" />
      </div>

      {error && <p className="col-span-full text-sm text-red-600">{error}</p>}

      <div className="col-span-full">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add to Watchlist'}
        </button>
      </div>
    </form>
  )
}

function Input({
  name,
  label,
  ...props
}: { name: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-600">
      {label}
      <input name={name} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" {...props} />
    </label>
  )
}

function Select({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-600">
      {label}
      <select name={name} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
