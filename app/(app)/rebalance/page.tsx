import { createClient } from '@/lib/supabase/server'
import RebalanceForm from '@/components/RebalanceForm'
import RebalanceTable from '@/components/RebalanceTable'
import type { QuarterlyReview } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function RebalancePage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('quarterly_reviews')
    .select('*')
    .order('created_at', { ascending: false })
  const reviews = (data ?? []) as QuarterlyReview[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Quarterly Rebalance</h1>
        <p className="text-sm text-slate-500">
          One entry per quarter — thesis re-checks, trims, cuts, and lessons learned.
        </p>
      </div>
      <RebalanceForm />
      <RebalanceTable reviews={reviews} />
    </div>
  )
}
