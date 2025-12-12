'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TEXT } from '@/lib/constants/text'

interface NavItem {
  href: string
  labelKey: keyof typeof TEXT.sidebar
  icon: string
  iconFilled?: boolean
  disabled?: boolean
}

const navItems: NavItem[] = [
  { href: '/', labelKey: 'navDashboard', icon: 'dashboard', iconFilled: true },
  { href: '/negotiation', labelKey: 'navNegotiation', icon: 'handshake' },
  { href: '/history', labelKey: 'navHistory', icon: 'history', disabled: true },
  { href: '/reports', labelKey: 'navReports', icon: 'analytics', disabled: true },
  { href: '/settings', labelKey: 'navSettings', icon: 'settings', disabled: true },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--border-light)] bg-[var(--surface-light)]">
      <div className="flex h-full flex-col">
        {/* Brand Section */}
        <div className="flex items-center gap-3 p-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg leading-tight font-bold">{TEXT.sidebar.brandName}</h1>
            {TEXT.sidebar.planLabel && (
              <p className="text-xs font-medium text-[var(--text-muted)]">
                {TEXT.sidebar.planLabel}
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-2 px-4 py-4">
          {navItems.map(item => {
            const isActive = pathname === item.href
            const label = TEXT.sidebar[item.labelKey]
            const baseClassName = `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
              item.disabled
                ? 'cursor-not-allowed opacity-50'
                : isActive
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'text-[var(--text-main)] hover:bg-gray-100'
            }`

            if (item.disabled) {
              return (
                <div key={item.href} className={baseClassName} title={TEXT.sidebar.comingSoon}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <p className="text-sm font-medium">{label}</p>
                  <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                    {TEXT.sidebar.comingSoon}
                  </span>
                </div>
              )
            }

            return (
              <Link key={item.href} href={item.href} className={baseClassName}>
                <span
                  className={`material-symbols-outlined ${item.iconFilled && isActive ? 'filled' : ''}`}
                >
                  {item.icon}
                </span>
                <p className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</p>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
