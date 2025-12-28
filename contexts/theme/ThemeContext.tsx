'use client'

import { useMemo, type ReactNode } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  isDarkMode: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'kjopekraft-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}

export function useTheme(): ThemeContextValue {
  const { resolvedTheme, setTheme } = useNextTheme()

  return useMemo(() => {
    const effectiveTheme: Theme = resolvedTheme === 'dark' ? 'dark' : 'light'
    const toggleTheme = () => setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')

    return {
      theme: effectiveTheme,
      isDarkMode: effectiveTheme === 'dark',
      toggleTheme,
      setTheme,
    }
  }, [resolvedTheme, setTheme])
}
