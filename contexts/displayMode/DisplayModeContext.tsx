'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useTransition,
  type ReactNode,
} from 'react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { displayModes, type DisplayMode } from '@/lib/searchParams'

const STORAGE_KEY = 'salaryDisplayMode'

const parseStoredMode = (value: string | null): DisplayMode | null => {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    if (parsed === 'net' || parsed === 'gross') return parsed
  } catch {
    // Fallback to raw string if it wasn't JSON encoded
    if (value === 'net' || value === 'gross') return value
  }
  return null
}

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
    parseAsStringLiteral(displayModes).withDefault('gross'),
  )
  const [, startTransition] = useTransition()

  const persistMode = useCallback(
    (mode: DisplayMode) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mode))
      startTransition(() => {
        void setDisplayMode(mode)
      })
    },
    [setDisplayMode, startTransition],
  )

  // Hydrate from localStorage to respect previous preference
  useEffect(() => {
    const storedMode = parseStoredMode(localStorage.getItem(STORAGE_KEY))
    if (storedMode && storedMode !== displayMode) {
      persistMode(storedMode)
    }
  }, [displayMode, persistMode])

  // Persist preference for future visits
  useEffect(() => {
    if (displayMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(displayMode))
    }
  }, [displayMode])

  // Memoize the context value to prevent unnecessary renders
  const contextValue = useMemo(() => {
    const isNetMode = displayMode === 'net'
    const toggleMode = () => {
      const nextMode = isNetMode ? 'gross' : 'net'
      persistMode(nextMode)
    }
    const setMode = (mode: DisplayMode) => {
      persistMode(mode)
    }

    return { isNetMode, displayMode, toggleMode, setDisplayMode: setMode }
  }, [displayMode, persistMode])

  return <DisplayModeContext.Provider value={contextValue}>{children}</DisplayModeContext.Provider>
}

export function useDisplayMode() {
  const context = useContext(DisplayModeContext)
  if (context === undefined) {
    throw new Error('useDisplayMode must be used within a DisplayModeProvider')
  }
  return context
}
