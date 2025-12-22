'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import LoginOverlay from '@/components/auth/LoginOverlay'

type LoginOverlayVariant = 'default' | 'ai'

type LoginOverlayContextValue = {
  open: (options?: { variant?: LoginOverlayVariant }) => void
  close: () => void
}

const LoginOverlayContext = createContext<LoginOverlayContextValue | null>(null)

export function LoginOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [variant, setVariant] = useState<LoginOverlayVariant>('default')

  const open = useCallback((options?: { variant?: LoginOverlayVariant }) => {
    setVariant(options?.variant ?? 'default')
    setIsOpen(true)
  }, [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo<LoginOverlayContextValue>(() => ({ open, close }), [open, close])

  return (
    <LoginOverlayContext.Provider value={value}>
      {children}
      <LoginOverlay isOpen={isOpen} onClose={close} variant={variant} />
    </LoginOverlayContext.Provider>
  )
}

export function useLoginOverlay() {
  const context = useContext(LoginOverlayContext)
  if (!context) {
    throw new Error('useLoginOverlay must be used within LoginOverlayProvider')
  }
  return context
}
