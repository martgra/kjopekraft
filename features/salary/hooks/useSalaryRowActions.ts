'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusEvent, TouchEvent } from 'react'
import type { PayPoint } from '@/domain/salary'

interface UseSalaryRowActionsOptions {
  payPoint?: PayPoint
  onEditPayPoint?: (point: PayPoint) => void
  onRemovePayPoint?: (year: number, pay: number) => void
}

export function useSalaryRowActions({
  payPoint,
  onEditPayPoint,
  onRemovePayPoint,
}: UseSalaryRowActionsOptions) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const longPressTimer = useRef<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  const hasActions = Boolean(payPoint && (onEditPayPoint || onRemovePayPoint))

  const closeActions = useCallback(() => {
    setIsActionMenuOpen(false)
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const openActions = useCallback(() => {
    if (!hasActions) return
    setIsActionMenuOpen(true)
  }, [hasActions])

  const toggleActions = useCallback(() => {
    if (!hasActions) return
    setIsActionMenuOpen(open => !open)
  }, [hasActions])

  const handleTouchStart = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (!hasActions || e.touches.length !== 1) return
      touchStartX.current = e.touches[0]?.clientX ?? null
      longPressTimer.current = window.setTimeout(() => {
        openActions()
      }, 450)
    },
    [hasActions, openActions],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (!hasActions || touchStartX.current === null) return
      const currentX = e.touches[0]?.clientX
      if (currentX === undefined) return
      const deltaX = currentX - touchStartX.current
      if (deltaX < -40) {
        setIsActionMenuOpen(true)
        if (longPressTimer.current) {
          window.clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
      }
    },
    [hasActions],
  )

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    touchStartX.current = null
  }, [])

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        closeActions()
      }
    },
    [closeActions],
  )

  useEffect(() => {
    if (!isActionMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) {
        closeActions()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isActionMenuOpen, closeActions])

  return {
    hasActions,
    isActionMenuOpen,
    menuRef,
    rowRef,
    openActions,
    closeActions,
    toggleActions,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleBlur,
  }
}
