'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { PayPoint } from '@/domain/salary'
import { useSalaryDataContext } from '@/features/salary/providers/SalaryDataProvider'

const STORAGE_KEY = 'salary-calculator-demo-mode'

interface DemoModeContextValue {
  isDemoMode: boolean
  loadDemoData: (demoPoints: PayPoint[]) => void
  clearDemoData: () => void
}

const DemoModeContext = createContext<DemoModeContextValue | undefined>(undefined)

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const { payPoints, addPoint, removePoint } = useSalaryDataContext()
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setIsDemoMode(true)
    }
  }, [])

  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem(STORAGE_KEY, 'true')
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [isDemoMode])

  const clearAllPoints = useCallback(() => {
    payPoints.forEach(point => {
      removePoint(point.year, point.pay)
    })
  }, [payPoints, removePoint])

  const loadDemoData = useCallback(
    (demoPoints: PayPoint[]) => {
      clearAllPoints()
      demoPoints.forEach(point => addPoint(point))
      setIsDemoMode(true)
    },
    [addPoint, clearAllPoints],
  )

  const clearDemoData = useCallback(() => {
    clearAllPoints()
    setIsDemoMode(false)
  }, [clearAllPoints])

  const value = useMemo(
    () => ({
      isDemoMode,
      loadDemoData,
      clearDemoData,
    }),
    [isDemoMode, loadDemoData, clearDemoData],
  )

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>
}

export function useDemoMode() {
  const context = useContext(DemoModeContext)
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider')
  }
  return context
}
