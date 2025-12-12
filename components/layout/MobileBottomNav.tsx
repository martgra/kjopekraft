'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TEXT } from '@/lib/constants/text'

export default function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      label: TEXT.sidebar.navDashboard,
      icon: 'dashboard',
    },
    {
      href: '/negotiation',
      label: TEXT.sidebar.navNegotiation,
      icon: 'handshake',
    },
  ]

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-[var(--border-light)] bg-white shadow-lg lg:hidden">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
                isActive
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[24px] ${isActive ? 'font-bold' : ''}`}
              >
                {item.icon}
              </span>
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
