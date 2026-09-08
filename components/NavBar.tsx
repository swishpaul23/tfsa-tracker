import Link from 'next/link'
import SignOutButton from './SignOutButton'

const links = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/watchlist', label: 'Watchlist' },
  { href: '/dca', label: 'DCA Planner' },
  { href: '/trades', label: 'Trade Log' },
  { href: '/rebalance', label: 'Rebalance' },
]

export default function NavBar() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex flex-wrap items-center gap-5">
        <span className="font-semibold">TFSA Growth Tracker</span>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-sm text-slate-600 hover:text-slate-900">
            {l.label}
          </Link>
        ))}
      </div>
      <SignOutButton />
    </nav>
  )
}
