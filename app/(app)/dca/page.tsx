import { createClient } from '@/lib/supabase/server'
import DcaForm from '@/components/DcaForm'
import DcaTable from '@/components/DcaTable'
import type { DcaPlan } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DcaPage() {
  const supabase = createClient()
  const { data } = await supabase.from('dca_plans').select('*').order('created_at', { ascending: false })
  const plans = (data ?? []) as DcaPlan[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">DCA Entry Planner</h1>
        <p className="text-sm text-slate-500">
          Split a new position into three tranches (40/30/30) across your biweekly windows. Fire
          tranches 2 and 3 only if the thesis still holds — regardless of which way the price moved.
        </p>
      </div>
      <DcaForm />
      <DcaTable plans={plans} />
    </div>
  )
}
