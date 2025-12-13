'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'

interface ReferenceModeContextValue {
  isReferenceEnabled: boolean
  toggleReference: () => void
  setReferenceEnabled: (enabled: boolean) => void
}

const ReferenceModeContext = createContext<ReferenceModeContextValue | undefined>(undefined)

/**
 * Reference mode provider with localStorage persistence
 *
 * Note: For shareable URLs, nuqs can be integrated later.
 * See IMPROVEMENT_PLAN.md for migration path.
 */
export function ReferenceModeProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage with a lazy initializer - default false
  const [isReferenceEnabled, setIsReferenceEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('salaryReferenceEnabled')
      return saved === 'true'
    }
    return false
  })

  // Memoize the context value to prevent unnecessary renders
  const contextValue = useMemo(() => {
    const toggleReference = () => setIsReferenceEnabledState(prev => !prev)
    const setReferenceEnabled = (enabled: boolean) => setIsReferenceEnabledState(enabled)

    return { isReferenceEnabled, toggleReference, setReferenceEnabled }
  }, [isReferenceEnabled])

  // Persist to localStorage when the mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('salaryReferenceEnabled', String(isReferenceEnabled))
    }
  }, [isReferenceEnabled])

  return (
    <ReferenceModeContext.Provider value={contextValue}>{children}</ReferenceModeContext.Provider>
  )
}

export function useReferenceMode() {
  const context = useContext(ReferenceModeContext)
  if (context === undefined) {
    throw new Error('useReferenceMode must be used within a ReferenceModeProvider')
  }
  return context
}
