'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  isDarkMode: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

/**
 * Theme provider for dark mode
 * Persists theme preference in localStorage and syncs with system preference
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [manualTheme, setManualTheme] = useState<Theme | null>(null)
  const [mounted, setMounted] = useState(false)

  // Initialize theme from system preference and keep in sync
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const resolveTheme = (isDark: boolean) => (isDark ? 'dark' : 'light')
    const applyTheme = (nextTheme: Theme) => {
      setThemeState(nextTheme)
      document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    }

    applyTheme(manualTheme ?? resolveTheme(mediaQuery.matches))
    setMounted(true)

    const handleChange = (e: MediaQueryListEvent) => {
      if (manualTheme) return
      applyTheme(resolveTheme(e.matches))
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [manualTheme])

  const contextValue = useMemo(() => {
    const isDarkMode = theme === 'dark'

    const setTheme = (newTheme: Theme) => {
      setManualTheme(newTheme)
      setThemeState(newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }

    const toggleTheme = () => {
      setTheme(theme === 'light' ? 'dark' : 'light')
    }

    return { theme, isDarkMode, toggleTheme, setTheme }
  }, [theme])

  // Prevent flash of unstyled content
  if (!mounted) {
    return null
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
