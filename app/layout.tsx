import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'TFSA Growth Tracker',
  description: 'Watchlist, DCA planning, trade log, and portfolio tracking for a TFSA growth strategy.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans text-slate-900 antialiased">{children}</body>
    </html>
  )
}
