'use client'

import { useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { TEXT } from '@/lib/constants/text'

interface MobileBottomDrawerProps {
  isOpen: boolean
  onClose: () => void
  dashboardContent?: ReactNode
  negotiationContent?: ReactNode
  pointsCount?: number
}

export default function MobileBottomDrawer({
  isOpen,
  onClose,
  dashboardContent,
  negotiationContent,
  pointsCount = 0,
}: MobileBottomDrawerProps) {
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Determine content based on route
  const isDashboard = pathname === '/'
  const isNegotiation = pathname === '/negotiation'
  const content = isDashboard ? dashboardContent : isNegotiation ? negotiationContent : null
  const title = isDashboard
    ? TEXT.drawer.dashboardTitle
    : isNegotiation
      ? TEXT.drawer.negotiationTitle
      : ''

  if (!content) return null

  return (
    <>
      {/* Backdrop - only on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer - only on mobile */}
      <div
        className={`fixed right-0 bottom-0 left-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl transition-transform duration-300 ease-out lg:hidden dark:bg-gray-900 ${
          isOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        aria-hidden={!isOpen}
      >
        {/* Handle bar for swipe indication */}
        <div className="flex w-full items-center justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 pb-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h2 id="drawer-title" className="text-xl font-bold text-[var(--text-main)]">
              {title}
            </h2>
            {pointsCount > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
                {pointsCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="-mr-2 rounded-full p-2 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={TEXT.common.close}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Content - scrollable with bottom padding for mobile nav */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">{content}</div>
      </div>
    </>
  )
}
