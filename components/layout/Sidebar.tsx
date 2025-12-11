'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: string
  iconFilled?: boolean
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: 'dashboard', iconFilled: true },
  { href: '/history', label: 'History', icon: 'history' },
  { href: '/negotiation', label: 'Negotiation', icon: 'handshake' },
  { href: '/reports', label: 'Reports', icon: 'analytics' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-[var(--border-light)] bg-[var(--surface-light)] transition-colors duration-200">
      <div className="flex h-full flex-col">
        {/* Brand Section */}
        <div className="flex items-center gap-3 p-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg leading-tight font-bold">Kjøpekraft</h1>
            <p className="text-xs font-medium text-[var(--text-muted)]">Pro Plan</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-2 px-4 py-4">
          {navItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isActive
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'text-[var(--text-main)] hover:bg-gray-100'
                }`}
              >
                <span
                  className={`material-symbols-outlined ${item.iconFilled && isActive ? 'filled' : ''}`}
                >
                  {item.icon}
                </span>
                <p className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</p>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
