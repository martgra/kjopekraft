'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import LoginOverlay from '@/components/auth/LoginOverlay'
import { authClient } from '@/lib/auth-client'
import { STORAGE_KEYS } from '@/lib/constants/storage'

type LoginOverlayVariant = 'default' | 'ai'

type LoginOverlayContextValue = {
  open: (options?: { variant?: LoginOverlayVariant }) => void
  close: () => void
}

const LoginOverlayContext = createContext<LoginOverlayContextValue | null>(null)

export function LoginOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [variant, setVariant] = useState<LoginOverlayVariant>('default')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const getReturnTo = useCallback(() => {
    const search = searchParams?.toString()
    const basePath = search ? `${pathname}?${search}` : pathname
    const hash = typeof window === 'undefined' ? '' : window.location.hash
    return `${basePath}${hash}`
  }, [pathname, searchParams])

  const open = useCallback(
    (options?: { variant?: LoginOverlayVariant }) => {
      setVariant(options?.variant ?? 'default')
      setIsOpen(true)
      try {
        const returnTo = getReturnTo()
        window.localStorage.setItem(STORAGE_KEYS.loginReturnTo, returnTo)
      } catch (error) {
        console.warn('Failed to persist login return URL', error)
      }
    },
    [getReturnTo],
  )
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo<LoginOverlayContextValue>(() => ({ open, close }), [open, close])

  useEffect(() => {
    if (!session?.user) return
    try {
      const returnTo = window.localStorage.getItem(STORAGE_KEYS.loginReturnTo)
      if (!returnTo) return
      window.localStorage.removeItem(STORAGE_KEYS.loginReturnTo)
      if (returnTo === getReturnTo()) return
      router.replace(returnTo)
    } catch (error) {
      console.warn('Failed to restore login return URL', error)
    }
  }, [getReturnTo, router, session?.user])

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
