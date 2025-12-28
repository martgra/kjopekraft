'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { TEXT } from '@/lib/constants/text'
import { useTheme } from '@/contexts/theme/ThemeContext'

type UserSession = {
  user?: {
    image?: string | null
  }
} | null

type UserMenuProps = {
  session: UserSession | undefined
  isPending: boolean
  onSignOut: () => void
  onOpenLogin: () => void
  className?: string
}

export function UserMenu({ session, isPending, onSignOut, onOpenLogin, className }: UserMenuProps) {
  const { isDarkMode, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClose = () => setIsOpen(false)

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        handleClose()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (isPending) {
    return (
      <div
        className={`h-10 w-10 animate-pulse rounded-full border border-[var(--border-light)] bg-[var(--surface-subtle)] ${className ?? ''}`}
      />
    )
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => onOpenLogin()}
        className={`rounded-full border border-[var(--border-light)] bg-[var(--surface-light)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] shadow-sm transition-colors hover:border-[var(--primary)]/40 ${className ?? ''}`}
      >
        {TEXT.auth.signIn}
      </button>
    )
  }

  return (
    <div ref={menuRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="group relative flex size-10 items-center justify-center rounded-full border-2 border-[var(--border-light)] bg-[var(--surface-subtle)] transition-colors hover:bg-[var(--surface-light)]"
        aria-label={TEXT.auth.signOut}
        aria-expanded={isOpen}
        aria-controls={menuId}
      >
        {session.user.image ? (
          <Image
            alt={TEXT.sidebar.brandName}
            src={session.user.image}
            width={40}
            height={40}
            className="h-full w-full rounded-full object-cover p-0.5 opacity-90 transition-opacity group-hover:opacity-100"
          />
        ) : (
          <span className="material-symbols-outlined text-lg text-gray-500 dark:text-gray-300">
            person
          </span>
        )}
        <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[var(--background)]" />
      </button>

      {isOpen ? (
        <div
          id={menuId}
          className="absolute right-0 mt-3 w-64 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-light)] p-3 shadow-xl"
          role="menu"
        >
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-light)] bg-[var(--surface-subtle)] px-3 py-2">
            <div>
              <div className="text-sm font-semibold text-[var(--text-main)]">
                {TEXT.settings.themeToggleTitle}
              </div>
              <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                {TEXT.settings.themeToggleSubtitle}
              </div>
            </div>
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleTheme}
              className="relative h-6 w-11 cursor-pointer appearance-none rounded-full bg-[var(--surface-subtle)] transition before:absolute before:top-0.5 before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-[var(--surface-light)] before:shadow before:transition before:content-[''] checked:bg-[var(--primary)] checked:before:translate-x-5 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--surface-light)]"
              aria-label={TEXT.settings.themeToggleTitle}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              handleClose()
              onSignOut()
            }}
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
            role="menuitem"
          >
            {TEXT.auth.signOut}
            <span className="material-symbols-outlined text-base">logout</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
