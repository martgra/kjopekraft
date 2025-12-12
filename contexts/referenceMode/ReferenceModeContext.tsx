'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'

interface ReferenceModeContextValue {
  isReferenceEnabled: boolean
  toggleReference: () => void
}

const ReferenceModeContext = createContext<ReferenceModeContextValue | undefined>(undefined)

export function ReferenceModeProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage with a lazy initializer - default false
  const [isReferenceEnabled, setIsReferenceEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('salaryReferenceEnabled')
      return saved === 'true'
    }
    return false
  })

  // Memoize the context value to prevent unnecessary renders
  const contextValue = useMemo(() => {
    const toggleReference = () => setIsReferenceEnabled(prev => !prev)

    return { isReferenceEnabled, toggleReference }
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
