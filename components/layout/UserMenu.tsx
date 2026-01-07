'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { TEXT } from '@/lib/constants/text'
import { useTheme } from '@/contexts/theme/ThemeContext'
import { NEGOTIATION_DRAFT_COOKIE } from '@/lib/constants/cookies'
import InfoTooltip from '@/components/ui/atoms/InfoTooltip'
import { ModalShell } from '@/components/ui/atoms'

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement>(null)

  const closeMenu = useCallback(() => setIsOpen(false), [])
  const closeDeleteConfirm = useCallback(() => {
    setIsDeleteOpen(false)
  }, [])
  const handleClose = useCallback(() => closeMenu(), [closeMenu])
  const handleDeleteData = () => {
    closeMenu()
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    closeDeleteConfirm()
    const keysToRemove = ['salary-calculator-points', 'salary-inflation-base-year']

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch {
        // Ignore storage access errors (e.g., blocked by browser settings).
      }
    })

    const cookieBase = `${NEGOTIATION_DRAFT_COOKIE}=; path=/; max-age=0; samesite=lax`
    document.cookie = cookieBase
    if (window.location.protocol === 'https:') {
      document.cookie = `${cookieBase}; secure`
    }

    window.location.reload()
  }
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

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

          <div className="mt-3 rounded-xl border border-[var(--border-light)] bg-[var(--surface-subtle)] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-[var(--text-main)]">
                {TEXT.settings.dataResetTitle}
              </div>
              <InfoTooltip label={TEXT.settings.dataResetDescription} side="left" align="end" />
            </div>
            <button
              type="button"
              onClick={handleDeleteData}
              className="mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
              role="menuitem"
            >
              {TEXT.settings.dataResetButton}
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
            </button>
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
      {isDeleteOpen && isMounted
        ? createPortal(
            <ModalShell
              onClose={closeDeleteConfirm}
              className="max-w-md overflow-hidden rounded-2xl"
              backdropClassName="z-[70] bg-black/70"
              wrapperClassName="z-[80]"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--primary)]">
                    delete_sweep
                  </span>
                  <h3 className="text-base font-bold text-[var(--text-main)]">
                    {TEXT.settings.dataResetTitle}
                  </h3>
                </div>
                <button
                  onClick={closeDeleteConfirm}
                  className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
                  aria-label={TEXT.common.close}
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-[var(--text-main)]">
                  {TEXT.settings.dataResetConfirmLabel}
                </p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {TEXT.settings.dataResetDescription}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeDeleteConfirm}
                    className="flex-1 rounded-xl border border-[var(--border-light)] bg-[var(--surface-subtle)] px-3 py-2 text-sm font-semibold text-[var(--text-main)] transition-colors hover:bg-[var(--surface-light)]"
                  >
                    {TEXT.settings.dataResetCancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="flex-1 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
                  >
                    {TEXT.settings.dataResetConfirmButton}
                  </button>
                </div>
              </div>
            </ModalShell>,
            document.body,
          )
        : null}
    </div>
  )
}
