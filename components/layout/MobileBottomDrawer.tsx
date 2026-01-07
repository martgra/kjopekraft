'use client'

import { useEffect, ReactNode, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { TEXT } from '@/lib/constants/text'

interface MobileBottomDrawerProps {
  isOpen: boolean
  onClose: () => void
  dashboardContent?: ReactNode
  negotiationContent?: ReactNode
  pointsCount?: number
  variant?: 'drawer' | 'sheet'
}

export default function MobileBottomDrawer({
  isOpen,
  onClose,
  dashboardContent,
  negotiationContent,
  pointsCount = 0,
  variant = 'drawer',
}: MobileBottomDrawerProps) {
  const pathname = usePathname()
  const isDashboard = pathname === '/'
  const isNegotiation = pathname === '/negotiation'
  const content = isDashboard ? dashboardContent : isNegotiation ? negotiationContent : null
  const title = isDashboard
    ? TEXT.drawer.dashboardTitle
    : isNegotiation
      ? TEXT.drawer.negotiationTitle
      : ''
  const isSheet = variant === 'sheet'

  // Close drawer on route change
  const previousPathRef = useRef(pathname)
  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname
      onClose()
    }
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
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!content || !isOpen) return null

  return (
    <>
      {/* Backdrop - only on mobile */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer - only on mobile */}
      <div
        className={`fixed bottom-0 z-50 flex max-h-[85vh] min-h-0 w-full flex-col overflow-hidden rounded-t-3xl bg-[var(--surface-light)] pb-[env(safe-area-inset-bottom)] shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isSheet
            ? 'left-1/2 max-w-md -translate-x-1/2 border-t border-[var(--border-light)]'
            : 'right-0 left-0'
        } translate-y-0`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Handle bar for swipe indication */}
        <div className="flex w-full items-center justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-light)] px-6 pb-4">
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
        <div className={`min-h-0 flex-1 overflow-y-auto px-4 ${isNegotiation ? 'pb-2' : 'pb-8'}`}>
          {content}
        </div>
      </div>
    </>
  )
}
