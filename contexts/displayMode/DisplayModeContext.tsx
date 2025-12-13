'use client'

import React, { createContext, useContext, useMemo, useTransition, type ReactNode } from 'react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { displayModes, type DisplayMode } from '@/lib/searchParams'

interface DisplayModeContextValue {
  isNetMode: boolean
  displayMode: DisplayMode
  toggleMode: () => void
  setDisplayMode: (mode: DisplayMode) => void
}

const DisplayModeContext = createContext<DisplayModeContextValue | undefined>(undefined)

/**
 * Display mode provider using nuqs (URL state, shareable + hydration-safe)
 */
export function DisplayModeProvider({ children }: { children: ReactNode }) {
  const [displayMode, setDisplayMode] = useQueryState(
    'display',
    parseAsStringLiteral(displayModes).withDefault('net'),
  )
  const [, startTransition] = useTransition()

  // Memoize the context value to prevent unnecessary renders
  const contextValue = useMemo(() => {
    const isNetMode = displayMode === 'net'
    const toggleMode = () =>
      startTransition(() => {
        void setDisplayMode(prev => (prev === 'net' ? 'gross' : 'net'))
      })
    const setMode = (mode: DisplayMode) =>
      startTransition(() => {
        void setDisplayMode(mode)
      })

    return { isNetMode, displayMode, toggleMode, setDisplayMode: setMode }
  }, [displayMode, setDisplayMode, startTransition])

  return <DisplayModeContext.Provider value={contextValue}>{children}</DisplayModeContext.Provider>
}

export function useDisplayMode() {
  const context = useContext(DisplayModeContext)
  if (context === undefined) {
    throw new Error('useDisplayMode must be used within a DisplayModeProvider')
  }
  return context
}
