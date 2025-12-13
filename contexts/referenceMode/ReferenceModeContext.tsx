'use client'

import React, { createContext, useContext, useMemo, useTransition, type ReactNode } from 'react'
import { parseAsBoolean, useQueryState } from 'nuqs'

interface ReferenceModeContextValue {
  isReferenceEnabled: boolean
  toggleReference: () => void
  setReferenceEnabled: (enabled: boolean) => void
}

const ReferenceModeContext = createContext<ReferenceModeContextValue | undefined>(undefined)

/**
 * Reference mode provider with URL-based state (nuqs)
 */
export function ReferenceModeProvider({ children }: { children: ReactNode }) {
  const [isReferenceEnabled, setIsReferenceEnabled] = useQueryState(
    'reference',
    parseAsBoolean.withDefault(false),
  )
  const [, startTransition] = useTransition()

  // Memoize the context value to prevent unnecessary renders
  const contextValue = useMemo(() => {
    const toggleReference = () =>
      startTransition(() => {
        void setIsReferenceEnabled(prev => !prev)
      })
    const setReferenceEnabled = (enabled: boolean) =>
      startTransition(() => {
        void setIsReferenceEnabled(enabled)
      })

    return { isReferenceEnabled, toggleReference, setReferenceEnabled }
  }, [isReferenceEnabled, setIsReferenceEnabled, startTransition])

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
