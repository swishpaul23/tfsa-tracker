import { createClient } from '@/lib/supabase/server'
import TradeForm from '@/components/TradeForm'
import TradeTable from '@/components/TradeTable'
import type { Trade } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function TradesPage() {
  const supabase = createClient()
  const { data } = await supabase.from('trades').select('*').order('trade_date', { ascending: false })
  const trades = (data ?? []) as Trade[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Trade Log</h1>
        <p className="text-sm text-slate-500">Source of truth for cost basis — log every actual buy/sell here.</p>
      </div>
      <TradeForm />
      <TradeTable trades={trades} />
    </div>
  )
}
