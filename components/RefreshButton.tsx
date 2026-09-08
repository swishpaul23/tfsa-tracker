'use client'

import { useRouter } from 'next/navigation'

export default function RefreshButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.refresh()}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
    >
      Refresh Prices
    </button>
  )
}
