'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { resolvePurchasingPowerBaseYear } from '@/domain/salary'
import type { PayPoint } from '@/domain/salary'

type BaseSelection = 'auto' | number

interface PurchasingPowerBaseContextValue {
  baseSelection: BaseSelection
  setBaseSelection: (value: BaseSelection) => void
  baseYearOverride?: number
}

const STORAGE_KEY = 'salary-inflation-base-year'

const PurchasingPowerBaseContext = createContext<PurchasingPowerBaseContextValue | undefined>(
  undefined,
)

export function PurchasingPowerBaseProvider({ children }: { children: ReactNode }) {
  const [baseSelection, setBaseSelectionState] = useState<BaseSelection>(() => {
    if (typeof window === 'undefined') return 'auto'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return 'auto'
    try {
      const parsed = JSON.parse(stored)
      if (parsed === 'auto') return 'auto'
      if (Number.isFinite(parsed)) return Number(parsed) as BaseSelection
    } catch {
      return 'auto'
    }
    return 'auto'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const value = baseSelection === 'auto' ? 'auto' : Number(baseSelection)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  }, [baseSelection])

  const baseYearOverride = useMemo(
    () => (baseSelection === 'auto' ? undefined : baseSelection),
    [baseSelection],
  )

  const setBaseSelection = (value: BaseSelection) => {
    setBaseSelectionState(value === 'auto' ? 'auto' : Number(value))
  }

  const value = useMemo(
    () => ({
      baseSelection,
      setBaseSelection,
      baseYearOverride,
    }),
    [baseSelection, baseYearOverride],
  )

  return (
    <PurchasingPowerBaseContext.Provider value={value}>
      {children}
    </PurchasingPowerBaseContext.Provider>
  )
}

export function usePurchasingPowerBase() {
  const ctx = useContext(PurchasingPowerBaseContext)
  if (!ctx)
    throw new Error('usePurchasingPowerBase must be used within PurchasingPowerBaseProvider')
  return ctx
}

export function useResolvedPurchasingPowerBase(
  payPoints: PayPoint[],
  currentYear: number,
): number | null {
  const { baseYearOverride } = usePurchasingPowerBase()
  return useMemo(
    () => resolvePurchasingPowerBaseYear(payPoints, currentYear, baseYearOverride),
    [payPoints, currentYear, baseYearOverride],
  )
}
