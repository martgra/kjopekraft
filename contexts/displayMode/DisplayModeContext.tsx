'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'

type DisplayMode = 'net' | 'gross'

interface DisplayModeContextValue {
  isNetMode: boolean
  displayMode: DisplayMode
  toggleMode: () => void
  setDisplayMode: (mode: DisplayMode) => void
}

const DisplayModeContext = createContext<DisplayModeContextValue | undefined>(undefined)

/**
 * Display mode provider with localStorage persistence
 *
 * Note: For shareable URLs, nuqs can be integrated later.
 * See IMPROVEMENT_PLAN.md for migration path.
 */
export function DisplayModeProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage with a lazy initializer
  const [displayMode, setDisplayModeState] = useState<DisplayMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('salaryDisplayMode')
      return saved === 'gross' ? 'gross' : 'net'
    }
    return 'net'
  })

  // Memoize the context value to prevent unnecessary renders
  const contextValue = useMemo(() => {
    const isNetMode = displayMode === 'net'
    const toggleMode = () => setDisplayModeState(prev => (prev === 'net' ? 'gross' : 'net'))
    const setDisplayMode = (mode: DisplayMode) => setDisplayModeState(mode)

    return { isNetMode, displayMode, toggleMode, setDisplayMode }
  }, [displayMode])

  // Persist to localStorage when the mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('salaryDisplayMode', displayMode)
    }
  }, [displayMode])

  return <DisplayModeContext.Provider value={contextValue}>{children}</DisplayModeContext.Provider>
}

export function useDisplayMode() {
  const context = useContext(DisplayModeContext)
  if (context === undefined) {
    throw new Error('useDisplayMode must be used within a DisplayModeProvider')
  }
  return context
}
