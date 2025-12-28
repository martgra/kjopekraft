'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type ToastVariant = 'default' | 'error' | 'success'

type Toast = {
  id: string
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  showToast: (message: string, options?: { variant?: ToastVariant; durationMs?: number }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timeoutsRef = useRef<Map<string, number>>(new Map())

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
    const timeoutId = timeoutsRef.current.get(id)
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutsRef.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message: string, options?: { variant?: ToastVariant; durationMs?: number }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const toast: Toast = {
        id,
        message,
        variant: options?.variant ?? 'default',
      }
      setToasts(prev => [...prev, toast])
      const timeoutId = window.setTimeout(() => removeToast(id), options?.durationMs ?? 4000)
      timeoutsRef.current.set(id, timeoutId)
    },
    [removeToast],
  )

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[70] flex w-[320px] flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              toast.variant === 'error'
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200'
                : toast.variant === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                  : 'border-[var(--border-light)] bg-white text-[var(--text-main)] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
