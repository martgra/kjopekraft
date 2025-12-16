'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TEXT } from '@/lib/constants/text'

interface MobileBottomNavProps {
  onOpenDrawer?: () => void
  pointsCount?: number
}

export default function MobileBottomNav({ onOpenDrawer, pointsCount = 0 }: MobileBottomNavProps) {
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
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-[var(--border-light)] bg-white shadow-lg lg:hidden dark:bg-gray-900">
      <div className="relative flex items-center justify-around">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
                isActive
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              } ${index === 0 ? 'mr-8' : 'ml-8'}`}
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

        {/* Floating Action Button - centered */}
        <button
          onClick={onOpenDrawer}
          className="absolute -top-6 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          aria-label={TEXT.drawer.openDrawer}
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
          {pointsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {pointsCount > 9 ? '9+' : pointsCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}
