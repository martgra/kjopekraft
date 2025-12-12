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
        className={`fixed right-0 bottom-0 left-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Handle bar for swipe indication */}
        <div className="flex w-full items-center justify-center py-3">
          <div className="h-1 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-light)] px-4 pb-3">
          <div className="flex items-center gap-2">
            <h2 id="drawer-title" className="text-lg font-semibold text-[var(--text-main)]">
              {title}
            </h2>
            {pointsCount > 0 && (
              <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs text-white">
                {pointsCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label={TEXT.common.close}
          >
            <span className="material-symbols-outlined text-[20px] text-[var(--text-muted)]">
              close
            </span>
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto">{content}</div>
      </div>
    </>
  )
}
