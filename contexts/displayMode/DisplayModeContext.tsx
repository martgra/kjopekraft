'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'

type DisplayMode = 'net' | 'gross'

interface DisplayModeContextValue {
  isNetMode: boolean
  toggleMode: () => void
}

const DisplayModeContext = createContext<DisplayModeContextValue | undefined>(undefined)

export function DisplayModeProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage with a lazy initializer
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('salaryDisplayMode')
      return saved === 'gross' ? 'gross' : 'net'
    }
    return 'net'
  })

  // Memoize the context value to prevent unnecessary renders
  const contextValue = useMemo(() => {
    const isNetMode = displayMode === 'net'
    const toggleMode = () => setDisplayMode(prev => (prev === 'net' ? 'gross' : 'net'))

    return { isNetMode, toggleMode }
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
