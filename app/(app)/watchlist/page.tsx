import { createClient } from '@/lib/supabase/server'
import WatchlistForm from '@/components/WatchlistForm'
import WatchlistTable from '@/components/WatchlistTable'
import type { WatchlistItem } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function WatchlistPage() {
  const supabase = createClient()
  const { data } = await supabase.from('watchlist').select('*').order('created_at', { ascending: false })
  const items = (data ?? []) as WatchlistItem[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Watchlist & Screener</h1>
        <p className="text-sm text-slate-500">
          Score candidates before buying. Total score ≥ 8/10 = strong candidate, ≥ 6 = watch.
        </p>
      </div>
      <WatchlistForm />
      <WatchlistTable items={items} />
    </div>
  )
}
